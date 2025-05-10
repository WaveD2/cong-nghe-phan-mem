import { Response } from "express";
import { AuthRequest } from "../types/api";
import { Model, Types } from "mongoose";
import IProduct from "../types/interface/IProduct";
import ICart from "../types/interface/ICart";
import Product from "../models/productModel";
import Cart from "../models/cartModel";
import MessageBroker from "../utils/messageBroker";
import { Event } from "../types/events";

// file xử lý logic của server
class CartController {
  private productModel: Model<IProduct>;
  private cartModel: Model<ICart>;
  private kafka: MessageBroker;

  constructor() {
    this.productModel = Product;
    this.cartModel = Cart;
    this.kafka = new MessageBroker();
  }

  // tạo giỏ hàng
  async addCart(req: AuthRequest, res: Response): Promise<any> {
    try {
      const { id, quantity } = req.body;

      if (!id || !quantity) {
        return res
          .status(400)
          .json({ message: "thiết trường thông tin" });
      }

      const objectId = new Types.ObjectId(id);

      const product = await this.productModel.findById(objectId);

      if (!product) {
        return res.status(400).json({ message: "Sản phẩm không tồn tại" });
      }

      if(product.stock < quantity) {
        return res.status(400).json({ message: "Số lượng đặt hàng quá số lượng trong kho" });
      }

      const userId = req.user;
      //tìm kiếm giỏ hàng
      const updateCart = await this.cartModel.findOneAndUpdate(
        { userId: userId, "items.productId": id },
        { $set: { "items.$.quantity": quantity } },
        { new: true }
      );
      // nếu giỏ hàng tồn tại rồi thì mình cập nhật
      if (updateCart) {
        // gửi thông báo cho các service khác biết để đồng bộ dữ liệu
        await this.kafka.publish(
          "Cart-Topic",
          { data: updateCart },
          Event.UPDATE
        );
        return res
          .status(200)
          .json({ message: "Cập nhật thành công", data: updateCart });
      } else {
        const newCart = await this.cartModel.findOneAndUpdate(
          { userId },
          { $push: { items: { productId: id, quantity: quantity } } },
          { new: true, upsert: true }
        );
        // gửi thông báo cho các service khác biết để đồng bộ dữ liệu
        await this.kafka.publish("Cart-Topic", { data: newCart }, Event.UPSERT);
        return res
          .status(200)
          .json({ message: "Tạo giỏ hàng thành công", data: newCart });
      }
    } catch (error) {
      console.error("Lỗi tạo giỏ hàng:", error);
      return res.status(400).json({ message: "Lỗi tạo giỏ hàng" });
    }
  }

  // lấy danh sách giỏ hàng

  async getCart(req: AuthRequest, res: Response): Promise<any> {
    try {
      const getCart = await this.cartModel
        .findOne({ userId: req.user })
        .populate("items.productId");
      return res.status(200).json({ data: getCart });
    } catch (error) {
      throw new Error("Lỗi không có giỏ hàng");
    }
  }
  // xóa sản phẩm trong giỏ hàng

  async removeCart(req: AuthRequest, res: Response): Promise<any> {
    try {
      const { id } = req.body;

      const findProduct = await this.productModel.findOne({ _id: id });

      if (!findProduct) throw new Error("Không tìm thấy sản phẩm!");

      const cartRemove = await this.cartModel.findOneAndUpdate(
        { userId: req.user },
        {
          $pull: {
            items: { productId: id },
          },
        },
        { new: true }
      );
      if (cartRemove) {
        // gửi thông báo cho các service khác biết xóa giỏ hàng để đồng bộ dữ liệu
        await this.kafka.publish(
          "Cart-Topic",
          { data: cartRemove },
          Event.UPDATE
        );
        return res.status(200).json({ message: "Xóa thành công" });
      }
      return res.status(404).json({ message: "Lỗi xóa giỏ hàng" });
    } catch (error : any) {
      console.error("Lỗi Remove Cart:", error);
      return res.status(400).json({ message: error.message || "Lỗi xóa giỏ hàng" });
    }
  }
}

export default CartController;
