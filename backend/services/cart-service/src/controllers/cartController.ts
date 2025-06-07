import { Response } from "express";
import { Model, Types } from "mongoose";
import { AuthRequest } from "../types/api";
import { IProduct } from "../types/interface/IProduct";
import ICart from "../types/interface/ICart";
import Product from "../models/productModel";
import Cart from "../models/cartModel";
import MessageBroker from "../utils/messageBroker";
import { Event } from "../types/events";

const ERROR_MESSAGES = {
  MISSING_FIELDS: "Thiếu trường thông tin",
  INVALID_OBJECT_ID: "ID không hợp lệ",
  PRODUCT_NOT_FOUND: "Sản phẩm không tồn tại",
  INSUFFICIENT_STOCK: "Số lượng đặt hàng vượt quá số lượng trong kho",
  CART_NOT_FOUND: "Không tìm thấy giỏ hàng",
  CART_REMOVE_ERROR: "Lỗi xóa giỏ hàng",
  SERVER_ERROR: "Lỗi server",
  CART_EMPTY: "Giỏ hàng trống",
  UNAUTHORIZED: "Không có quyền truy cập",
};

interface CartItemInput {
  id: string;
  quantity: number;
}

class CartController {
  private readonly productModel: Model<IProduct>;
  private readonly cartModel: Model<ICart>;
  private readonly kafka: MessageBroker;

  constructor() {
    this.productModel = Product;
    this.cartModel = Cart;
    this.kafka = new MessageBroker();
  }

  private async publishToKafka(cart: ICart, event: Event): Promise<void> {
    try {
      await this.kafka.publish("Cart-Topic", { data: cart }, event);
    } catch (kafkaError) {
      console.error("Kafka publish failed:", kafkaError);
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

  private validateCartInput({ id, quantity }: CartItemInput, res: Response): boolean {
    if (!id || !quantity || quantity <= 0) {
      res.status(400).json({ message: ERROR_MESSAGES.MISSING_FIELDS });
      return false;
    }
    return true;
  }

  async addCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      const input: CartItemInput = req.body;
      if (!this.validateCartInput(input, res)) return;

      const objectId = this.validateObjectId(input.id, res);
      if (!objectId) return;

      const product = await this.productModel.findById(objectId);
      if (!product) {
        res.status(404).json({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
        return;
      }

      if (product.stock < input.quantity) {
        res.status(400).json({ message: ERROR_MESSAGES.INSUFFICIENT_STOCK });
        return;
      }

      const userId = this.getUserId(req);
      const updateCart = await this.cartModel.findOneAndUpdate(
        { userId, "items.productId": objectId },
        { $set: { "items.$.quantity": Number(input.quantity) } },
        { new: true }
      );

      if (updateCart) {
        await this.publishToKafka(updateCart, Event.UPDATE);
        res.status(200).json({ message: "Cập nhật giỏ hàng thành công", data: updateCart });
        return;
      }

      const newCart = await this.cartModel.findOneAndUpdate(
        { userId },
        { $push: { items: { productId: objectId, quantity: Number(input.quantity) } } },
        { new: true, upsert: true }
      );

      await this.publishToKafka(newCart, Event.UPSERT);
      res.status(201).json({ message: "Tạo giỏ hàng thành công", data: newCart });
    } catch (error) {
      console.error("Lỗi tạo/cập nhật giỏ hàng:", error);
      res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async getCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const cart = await this.cartModel
        .findOne({ userId })
        .populate("items.productId")
        .lean();
      res.status(200).json({ data: cart || null });
    } catch (error) {
      console.error("Lỗi lấy giỏ hàng:", error);
      res.status(500).json({ message: ERROR_MESSAGES.CART_NOT_FOUND });
    }
  }

  async get(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const objectId = this.validateObjectId(id, res);
      if (!objectId) return;

      const cart = await this.cartModel.findById(objectId).lean();
      res.status(200).json({ data: cart || null });
    } catch (error) {
      console.error("Lỗi lấy giỏ hàng:", error);
      res.status(500).json({ message: ERROR_MESSAGES.CART_NOT_FOUND });
    }
  }

  async removeCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.body;
      const objectId = this.validateObjectId(id, res);
      if (!objectId) return;

      const product = await this.productModel.findById(objectId);
      if (!product) {
        res.status(404).json({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
        return;
      }

      const userId = this.getUserId(req);
      const cartRemove = await this.cartModel.findOneAndUpdate(
        { userId, "items.productId": objectId },
        { $pull: { items: { productId: objectId } } },
        { new: true }
      );

      if (!cartRemove) {
        res.status(404).json({ message: ERROR_MESSAGES.CART_NOT_FOUND });
        return;
      }

      await this.publishToKafka(cartRemove, Event.UPDATE);
      res.status(200).json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công", data: cartRemove });
    } catch (error) {
      console.error("Lỗi xóa sản phẩm khỏi giỏ hàng:", error);
      res.status(500).json({ message: ERROR_MESSAGES.CART_REMOVE_ERROR });
    }
  }

  async updateCartItemQuantity(req: AuthRequest, res: Response): Promise<void> {
    try {
      const input: CartItemInput = req.body;
      if (!this.validateCartInput(input, res)) return;

      const objectId = this.validateObjectId(input.id, res);
      if (!objectId) return;

      const product = await this.productModel.findById(objectId);
      if (!product) {
        res.status(404).json({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
        return;
      }

      if (product.stock < input.quantity) {
        res.status(400).json({ message: ERROR_MESSAGES.INSUFFICIENT_STOCK });
        return;
      }

      const userId = this.getUserId(req);
      const updatedCart = await this.cartModel.findOneAndUpdate(
        { userId, "items.productId": objectId },
        { $set: { "items.$.quantity": Number(input.quantity) } },
        { new: true }
      );

      if (!updatedCart) {
        res.status(404).json({ message: ERROR_MESSAGES.CART_NOT_FOUND });
        return;
      }

      await this.publishToKafka(updatedCart, Event.UPDATE);
      res.status(200).json({ message: "Cập nhật số lượng sản phẩm thành công", data: updatedCart });
    } catch (error) {
      console.error("Lỗi cập nhật số lượng sản phẩm:", error);
      res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async clearCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const clearedCart = await this.cartModel.findOneAndUpdate(
        { userId },
        { $set: { items: [] } },
        { new: true }
      );

      if (!clearedCart) {
        res.status(404).json({ message: ERROR_MESSAGES.CART_NOT_FOUND });
        return;
      }

      await this.publishToKafka(clearedCart, Event.UPDATE);
      res.status(200).json({ message: "Xóa toàn bộ giỏ hàng thành công", data: clearedCart });
    } catch (error) {
      console.error("Lỗi xóa toàn bộ giỏ hàng:", error);
      res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async getAllCarts(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Kiểm tra quyền admin (giả định req.user.role tồn tại)
      if (req.user?.role !== "admin") {
        res.status(403).json({ message: ERROR_MESSAGES.UNAUTHORIZED });
        return;
      }

      const carts = await this.cartModel
        .find()
        .populate("items.productId")
        .lean();
      res.status(200).json({ data: carts });
    } catch (error) {
      console.error("Lỗi lấy danh sách giỏ hàng:", error);
      res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async checkCartStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const cart = await this.cartModel.findOne({ userId }).lean();

      if (!cart || cart.items.length === 0) {
        res.status(200).json({ message: ERROR_MESSAGES.CART_EMPTY, data: null });
        return;
      }

      res.status(200).json({ message: "Giỏ hàng có sản phẩm", data: cart });
    } catch (error) {
      console.error("Lỗi kiểm tra trạng thái giỏ hàng:", error);
      res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }
}

export default CartController;