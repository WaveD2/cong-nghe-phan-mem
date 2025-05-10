import { Model } from "mongoose";
import { Request, Response } from "express";
import Product from "../models/productModel";
import { ProductType } from "../types/interface/IProduct";
import MessageBroker from "../utils/messageBroker";
import { ProductEvent } from "../types/kafkaType";

class ProductController {
  private ProductModel: Model<ProductType>;
  private kafka: MessageBroker;

  constructor() {
    this.ProductModel = Product;
    this.kafka = new MessageBroker();
  }
  // tạo sản phẩm
  async addProduct(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, price, stock } = req.body;

      if (!name || !description || !price || !stock)
        throw new Error("Thiếu trường thông tin");

      const exist = await this.ProductModel.findOne({ name });

      if (!exist) {
        const newProduct = await this.ProductModel.create({
          name: name,
          price: price,
          description: description,
          stock: stock,
        });

        try {
          await this.kafka.publish(
            "Product-Topic",
            { data: newProduct },
            ProductEvent.CREATE
          );
        } catch (kafkaError) {
          console.error("Kafka publish failed:", kafkaError);
          throw new Error("Failed to publish Kafka event");
        }

        res.status(201).json({ message: "Thêm sản phẩm thành công", data : newProduct });
        return

      } else {
        res.status(401).json({ message: "Sản phẩm đã tồn tại" });
        return

      }
    } catch (error: any) {
      res.status(400).json({ message: "Somthing Went Wrong..." });
      return

    }
  }
  // chỉnh sửa sản phẩm
  async editProduct(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, price, stock } = req.body;
      const { id } = req.params;

      const find = await this.ProductModel.findOne({ _id: id });

      if (find) {
        const updateProduct = await this.ProductModel.findByIdAndUpdate(
          { _id: find._id },
          {
            $set: {
              name: name,
              description: description,
              price: price,
              stock: stock,
            },
          },
          { new: true } 
        );

        await this.kafka.publish(
          "Product-Topic",
          { data: updateProduct },
          ProductEvent.UPDATE
        );

        if (updateProduct) {
          res.status(201).json({ message: "Cập nhật thành công." , data : updateProduct });
          return

        }
      }
      res.status(401).json({ message: "Sản phẩm không tồn tại" });
      return

    } catch (error) {
      res.status(400).json({ message: "Somthing Went Wrong..." });
      return

    }
  }
  // xóa sản phẩm
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (id) {
        const deleteProduct = await this.ProductModel.findByIdAndDelete(id);

        if (deleteProduct) {
          await this.kafka.publish(
            "Product-Topic",
            { data: deleteProduct },
            ProductEvent.UPDATE
          );
           res.status(200).json({ message: "Xóa thành công", data : deleteProduct });
            return
        }
         res.status(401).json({ message: "Sản phẩm không tồn tại" });
         return 
      }
    } catch (error) {
      res.status(400).json({ message: "Somthing Went Wrong..." });
      return
    }
  }
  // chi tiết sản phẩm
  async detailProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await this.ProductModel.findOne({ _id: id });
      if(!data) {
         res.status(404).json({ message: "Sản phẩm không tồn tại" });
         return
      }
        res.status(200).json({ data });
        return
    } catch (error) {
      res.status(400).json({ message: "Somthing Went Wrong..." });
      return
    }
  }
  // danh sách sản phẩm
  async listProduct(req: Request, res: Response): Promise<void> {
    try {
      const {limit = 10} = req.query
      const data = await this.ProductModel.find().limit(Number(limit));
      if(!data) {
         res.status(404).json({ message: "Sản phẩm không tồn tại" });
         return
      }
        res.status(200).json({ data });
        return
    } catch (error) {
      res.status(400).json({ message: "Somthing Went Wrong..." });
      return
    }
  }
}

export default ProductController;
