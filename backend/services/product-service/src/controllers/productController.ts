import { Model } from "mongoose";
import { Request, Response, NextFunction } from "express";
import Product from "../models/productModel";
import { ProductType } from "../types/interface/IProduct";
import MessageBroker from "../utils/messageBroker";
import { ProductEvent } from "../types/kafkaType";

const ERROR_MESSAGES = {
  MISSING_FIELDS: "Thiếu trường thông tin",
  PRODUCT_EXISTS: "Sản phẩm đã tồn tại",
  MISSING_ID: "Thiếu ID sản phẩm",
  PRODUCT_NOT_FOUND: "Sản phẩm không tồn tại",
};

const DEFAULT_LIMIT = 10;

class ProductController {
  private readonly ProductModel: Model<ProductType>;
  private readonly kafka: MessageBroker;

  constructor() {
    this.ProductModel = Product;
    this.kafka = new MessageBroker();
  }

  private async publishToKafka(
    product: ProductType,
    event: ProductEvent
  ): Promise<void> {
    try {
      await this.kafka.publish("Product-Topic", { data: product }, event);
    } catch (kafkaError) {
      console.error("Kafka publish failed:", kafkaError);
    }
  }

  private validateProductId(id: string | undefined, res: Response): boolean {
    if (!id) {
      res.status(400).json({ message: ERROR_MESSAGES.MISSING_ID });
      return false;
    }
    return true;
  }

  addProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, description, price, stock } = req.body;

      if (!name || !description || price == null || stock == null) {
        res.status(400).json({ message: ERROR_MESSAGES.MISSING_FIELDS });
        return;
      }

      const existingProduct = await this.ProductModel.findOne({ name });
      if (existingProduct) {
        res.status(409).json({ message: ERROR_MESSAGES.PRODUCT_EXISTS });
        return;
      }

      const newProduct = await this.ProductModel.create({
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
      });

      await this.publishToKafka(newProduct, ProductEvent.CREATE);

      res.status(201).json({ message: "Thêm sản phẩm thành công", data: newProduct });
    } catch (error) {
      next(error);
    }
  };

  editProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!this.validateProductId(id, res)) return;

      const product = await this.ProductModel.findById(id);
      if (!product) {
        res.status(404).json({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
        return;
      }

      const { name, description, price, stock } = req.body;
      const updates: Partial<ProductType> = {
        ...(name && { name: name.trim() }),
        ...(description && { description: description.trim() }),
        ...(price != null && { price: Number(price) }),
        ...(stock != null && { stock: Number(stock) }),
      };

      const updatedProduct = await this.ProductModel.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      );

      await this.publishToKafka(updatedProduct!, ProductEvent.UPDATE);

      res.status(200).json({ message: "Cập nhật thành công", data: updatedProduct });
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!this.validateProductId(id, res)) return;

      const deletedProduct = await this.ProductModel.findByIdAndDelete(id);
      if (!deletedProduct) {
        res.status(404).json({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
        return;
      }

      await this.publishToKafka(deletedProduct, ProductEvent.DELETE);

      res.status(200).json({ message: "Xóa thành công", data: deletedProduct });
    } catch (error) {
      next(error);
    }
  };

  detailProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!this.validateProductId(id, res)) return;

      const product = await this.ProductModel.findById(id);
      if (!product) {
        res.status(404).json({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
        return;
      }

      res.status(200).json({ data: product });
    } catch (error) {
      next(error);
    }
  };

  listProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = Number(req.query.limit) || DEFAULT_LIMIT;
      const products = await this.ProductModel.find().limit(Math.max(1, limit));

      res.status(200).json({ data: products });
    } catch (error) {
      next(error);
    }
  };
}

export default ProductController;