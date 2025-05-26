import { Response, NextFunction } from "express";
import { Model, Types } from "mongoose";
import { AuthRequest } from "../types/api";
import ICart from "../types/interface/ICart";
import IProduct from "../types/interface/IProduct";
import { IOrder } from "../types/interface/IOrder";
import Cart from "../models/cartModel";
import Product from "../models/productModel";
import Order from "../models/orderModel";
import MessageBroker from "../utils/messageBroker";
import { Event } from "../types/events";
import { TOPIC_TYPE } from "../types/kafkaType";

const ERROR_MESSAGES = {
  MISSING_FIELDS: "Thiếu trường thông tin",
  INVALID_OBJECT_ID: "ID không hợp lệ",
  CART_EMPTY: "Giỏ hàng đang rỗng",
  PRODUCT_NOT_FOUND: "Sản phẩm không tồn tại",
  INSUFFICIENT_STOCK: "Số lượng đặt hàng vượt quá số lượng trong kho",
  ORDER_NOT_FOUND: "Không tìm thấy đơn hàng",
  SERVER_ERROR: "Lỗi server",
};

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
}

class OrderController {
  private readonly kafka: MessageBroker;
  private readonly cartModel: Model<ICart>;
  private readonly productModel: Model<IProduct>;
  private readonly orderModel: Model<IOrder>;

  constructor() {
    this.kafka = new MessageBroker();
    this.cartModel = Cart;
    this.productModel = Product;
    this.orderModel = Order;
  }

  private async publishToKafka<T>(topic: TOPIC_TYPE, data: T, event: Event): Promise<void> {
    try {
      await this.kafka.publish(topic, { data }, event);
    } catch (kafkaError) {
      console.error(`Kafka publish failed for topic ${topic}:`, kafkaError);
    }
  }

  private getUserId(req: AuthRequest): string {
    const userId = req.user?.id || req.user?._id;
    if (!userId) throw new Error("Không tìm thấy thông tin người dùng");
    return userId;
  }

  private validateObjectId(id: string, res: Response): Types.ObjectId | null {
    try {
      return new Types.ObjectId(id);
    } catch {
      res.status(400).json({ message: ERROR_MESSAGES.INVALID_OBJECT_ID });
      return null;
    }
  }

  private validateShippingAddress(address: ShippingAddress, res: Response): boolean {
    if (!address.street || !address.city || !address.state) {
      res.status(400).json({ message: ERROR_MESSAGES.MISSING_FIELDS });
      return false;
    }
    return true;
  }

  async createOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { street, city, state } = req.body as ShippingAddress;
      if (!this.validateShippingAddress({ street, city, state }, res)) return;

      const userId = this.getUserId(req);
      const cart = await this.cartModel.findOne({ userId }).lean();
      if (!cart || cart.items.length === 0) {
        res.status(400).json({ message: ERROR_MESSAGES.CART_EMPTY });
        return;
      }

      const orderItems: Array<{ productId: Types.ObjectId; name: string; quantity: number; price: number }> = [];
      let totalAmount = 0;

      // Kiểm tra và cập nhật sản phẩm
      for (const item of cart.items) {
        const product = await this.productModel.findById(item.productId);
        if (!product) {
          res.status(404).json({ message: `${ERROR_MESSAGES.PRODUCT_NOT_FOUND}: ${item.productId}` });
          return;
        }
        if (product.stock < item.quantity) {
          res.status(400).json({
            message: `${ERROR_MESSAGES.INSUFFICIENT_STOCK}: ${product.name}`,
          });
          return;
        }

        product.stock -= item.quantity;
        const updatedProduct = await product.save();
        const productPrice = product.price * item.quantity;
        orderItems.push({
          //@ts-ignore
          productId: item.productId,
          name: product.name,
          quantity: item.quantity,
          price: productPrice,
        });
        totalAmount += productPrice;

        await this.publishToKafka("Order-Topic-Product", updatedProduct, Event.UPDATE);
      }

      // Tạo đơn hàng
      const order = await this.orderModel.create({
        userId,
        items: orderItems,
        shippingAddress: { street, city, state },
        totalAmount,
        paymentMethod: "Cash on Delivery",
        status: "Pending",
      });

      // Xóa giỏ hàng
      cart.items = [];
      const updatedCart = await this.cartModel.findOneAndUpdate(
        { userId },
        { $set: { items: [] } },
        { new: true }
      );

      await this.publishToKafka("Order-Topic-Cart", updatedCart, Event.UPDATE);

      res.status(201).json({ message: "Tạo đơn hàng thành công", data: order });
    } catch (error) {
      console.error("Lỗi tạo đơn hàng:", error);
      next(error);
    }
  }

  async getSingleOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const objectId = this.validateObjectId(id, res);
      if (!objectId) return;

      const userId = this.getUserId(req);
      const order = await this.orderModel
        .findOne({ userId, _id: objectId })
        .populate("userId")
        .populate("items.productId")
        .lean();

      if (!order) {
        res.status(404).json({ message: ERROR_MESSAGES.ORDER_NOT_FOUND });
        return;
      }

      res.status(200).json({ data: order });
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);
      next(error);
    }
  }

  async getAllOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const orders = await this.orderModel
        .find({ userId })
        .populate("userId")
        .populate("items.productId")
        .lean();

      if (!orders.length) {
        res.status(404).json({ message: ERROR_MESSAGES.ORDER_NOT_FOUND });
        return;
      }

      res.status(200).json({ data: orders });
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng:", error);
      next(error);
    }
  }
}

export default OrderController;