import { Response, NextFunction } from "express";
import { Model, Types } from "mongoose";
import { AuthRequest } from "../types/api";
import { ICart } from "../types/interface/ICart";
import { IProduct } from "../types/interface/IProduct";
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
  INVALID_STATUS: "Trạng thái đơn hàng không hợp lệ",
  CANNOT_MODIFY: "Không thể sửa đổi đơn hàng đã xử lý",
  UNAUTHORIZED: "Không có quyền truy cập",
};

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  detail?: string;
}

interface OrderReport {
  totalOrders: number;
  totalRevenue: number;
  statusBreakdown: { [key: string]: number };
  averageOrderValue: number;
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
      const { street, city, state, detail = "", paymentMethod } = req.body as ShippingAddress & { paymentMethod?: string };
      if (!this.validateShippingAddress({ street, city, state }, res)) return;

      const userId = this.getUserId(req);
      const cart = await this.cartModel.findOne({ userId }).lean();
      if (!cart || cart.items.length === 0) {
        res.status(400).json({ message: ERROR_MESSAGES.CART_EMPTY });
        return;
      }

      const orderItems: Array<{ productId: Types.ObjectId | null; name: string; quantity: number; price: number }> = [];
      let totalAmount = 0;

      for (const item of cart.items) {
        const product = await this.productModel.findById(item.productId);
        if (!product) {
          res.status(404).json({ message: `${ERROR_MESSAGES.PRODUCT_NOT_FOUND}: ${item.productId}` });
          return;
        }
        if (product.stock < item.quantity) {
          res.status(400).json({
            message: `${ERROR_MESSAGES.INSUFFICIENT_STOCK}: ${product.title}`,
          });
          return;
        }

        product.stock -= item.quantity;
        const updatedProduct = await product.save();
        const productPrice = product.price * item.quantity;
        orderItems.push({
          productId: this.validateObjectId(item.productId, res),
          name: product.title,
          quantity: item.quantity,
          price: productPrice,
        });
        totalAmount += productPrice;

        await this.publishToKafka("Order-Topic-Product", updatedProduct, Event.UPDATE);
      }

      const order = await this.orderModel.create({
        userId,
        items: orderItems,
        shippingAddress: { street, city, state, detail },
        totalAmount,
        paymentMethod: paymentMethod || "cod",
        status: "pending",
      });

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
      const query = req.user.role === "admin" ? { _id: objectId } : { userId, _id: objectId };
      const order = await this.orderModel
        .findOne(query)
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
      const query = req.user.role === "admin" ? {} : { userId };
      const orders = await this.orderModel
        .find(query)
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

  async updateOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, shippingAddress } = req.body;
      const objectId = this.validateObjectId(id, res);
      if (!objectId) return;

      const userId = this.getUserId(req);
      const query = req.user.role === "admin" ? { _id: objectId } : { _id: objectId, userId };
      const order = await this.orderModel.findOne(query);

      if (!order) {
        res.status(404).json({ message: ERROR_MESSAGES.ORDER_NOT_FOUND });
        return;
      }

      const updateData: Partial<IOrder> = {};

      if (status) {
        const validStatuses = ["pending", "shipped", "delivered", "cancelled", "completed"];
        if (!validStatuses.includes(status)) {
          res.status(400).json({ message: ERROR_MESSAGES.INVALID_STATUS });
          return;
        }
        updateData.status = status;

        if (status === "shipped") updateData.shippedDate = new Date();
        if (status === "delivered") {
          updateData.deliveryDate = new Date();
          updateData.isDelivered = true;
        }
        if (status === "completed") updateData.isPaid = true;
      }

      if (shippingAddress) {
        if (!this.validateShippingAddress(shippingAddress, res)) return;
        updateData.shippingAddress = shippingAddress;
      }

      const updatedOrder = await this.orderModel
        .findOneAndUpdate(
          query,
          { $set: updateData },
          { new: true }
        )
        .populate("userId")
        .populate("items.productId");


      res.status(200).json({ message: "Cập nhật đơn hàng thành công", data: updatedOrder });
    } catch (error) {
      console.error("Lỗi cập nhật đơn hàng:", error);
      next(error);
    }
  }

  async deleteOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const objectId = this.validateObjectId(id, res);
      if (!objectId) return;

      const userId = this.getUserId(req);
      const query = req.user.role === 'admin' ? { _id: objectId } : { _id: objectId, userId };
      const order = await this.orderModel.findOne(query);

      if (!order) {
        res.status(404).json({ message: ERROR_MESSAGES.ORDER_NOT_FOUND });
        return;
      }

      if (order.status !== "pending") {
        res.status(400).json({ message: ERROR_MESSAGES.CANNOT_MODIFY });
        return;
      }

      for (const item of order.items) {
        const product = await this.productModel.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          await product.save();
          await this.publishToKafka("Order-Topic-Product", product, Event.UPDATE);
        }
      }

      await this.orderModel.deleteOne(query);

      res.status(200).json({ message: "Xóa đơn hàng thành công" });
    } catch (error) {
      console.error("Lỗi xóa đơn hàng:", error);
      next(error);
    }
  }

  async cancelOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const objectId = this.validateObjectId(id, res);
      if (!objectId) return;

      const userId = this.getUserId(req);
      const query = req.user.role === 'admin' ? { _id: objectId } : { _id: objectId, userId };
      const order = await this.orderModel.findOne(query);

      if (!order) {
        res.status(404).json({ message: ERROR_MESSAGES.ORDER_NOT_FOUND });
        return;
      }

      if (order.status !== "pending") {
        res.status(400).json({ message: ERROR_MESSAGES.CANNOT_MODIFY });
        return;
      }

      for (const item of order.items) {
        const product = await this.productModel.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          await product.save();
          await this.publishToKafka("Order-Topic-Product", product, Event.UPDATE);
        }
      }

      order.status = "cancelled";
      const updatedOrder = await order.save();

      res.status(200).json({ message: "Hủy đơn hàng thành công", data: updatedOrder });
    } catch (error) {
      console.error("Lỗi hủy đơn hàng:", error);
      next(error);
    }
  }

  async getAllOrdersAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, startDate, endDate } = req.query;
      const query: any = {};

      if (status) query.status = status;
      if (startDate || endDate) {
        query.orderDate = {};
        if (startDate) query.orderDate.$gte = new Date(startDate as string);
        if (endDate) query.orderDate.$lte = new Date(endDate as string);
      }

      const orders = await this.orderModel
        .find(query)
        .populate("userId")
        .populate("items.productId")
        .sort({ orderDate: -1 })
        .lean();

      if (!orders.length) {
        res.status(404).json({ message: ERROR_MESSAGES.ORDER_NOT_FOUND });
        return;
      }

      res.status(200).json({ data: orders });
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng admin:", error);
      next(error);
    }
  }

  async updateOrderStatusAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, isPaid } = req.body;
      const objectId = this.validateObjectId(id, res);
      if (!objectId) return;

      const order = await this.orderModel.findById(objectId);
      if (!order) {
        res.status(404).json({ message: ERROR_MESSAGES.ORDER_NOT_FOUND });
        return;
      }

      const updateData: Partial<IOrder> = {};

      if (status) {
        const validStatuses = ["pending", "shipped", "delivered", "cancelled", "completed"];
        if (!validStatuses.includes(status)) {
          res.status(400).json({ message: ERROR_MESSAGES.INVALID_STATUS });
          return;
        }
        updateData.status = status;

        if (status === "shipped") updateData.shippedDate = new Date();
        if (status === "delivered") {
          updateData.deliveryDate = new Date();
          updateData.isDelivered = true;
        }
        if (status === "completed") updateData.isPaid = true;
      }

      if (typeof isPaid === "boolean") {
        updateData.isPaid = isPaid;
      }

      const updatedOrder = await this.orderModel
        .findByIdAndUpdate(
          objectId,
          { $set: updateData },
          { new: true }
        )
        .populate("userId")
        .populate("items.productId");


      res.status(200).json({ message: "Cập nhật trạng thái đơn hàng thành công", data: updatedOrder });
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái đơn hàng admin:", error);
      next(error);
    }
  }

  async getOrderReportAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const query: any = {};

      if (startDate || endDate) {
        query.orderDate = {};
        if (startDate) query.orderDate.$gte = new Date(startDate as string);
        if (endDate) query.orderDate.$lte = new Date(endDate as string);
      }

      const orders = await this.orderModel.find(query).lean();

      const report: OrderReport = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
        statusBreakdown: orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number }),
        averageOrderValue: orders.length ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0,
      };

      res.status(200).json({ message: "Báo cáo đơn hàng", data: report });
    } catch (error) {
      console.error("Lỗi tạo báo cáo đơn hàng:", error);
      next(error);
    }
  }
}

export default OrderController;