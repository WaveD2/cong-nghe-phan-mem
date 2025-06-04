import { FilterQuery, Model } from "mongoose";
import { Request, Response, NextFunction } from "express";
import Product from "../models/productModel";
import { IProduct } from "../types/interface/IProduct";
import MessageBroker from "../utils/messageBroker";
import { ProductEvent } from "../types/kafkaType";
import { productValidator } from "./validate";
import { z } from "zod";

const ERROR_MESSAGES = {
  MISSING_FIELDS: "Thiếu trường thông tin",
  PRODUCT_EXISTS: "Sản phẩm đã tồn tại",
  MISSING_ID: "Thiếu ID sản phẩm",
  PRODUCT_NOT_FOUND: "Sản phẩm không tồn tại",
};

const DEFAULT_LIMIT = 10;

class ProductController {
  private readonly ProductModel: Model<IProduct>;
  private readonly kafka: MessageBroker;

  constructor() {
    this.ProductModel = Product;
    this.kafka = new MessageBroker();
  }

  private async publishToKafka(
    product: IProduct,
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
      res.status(400).json({ success: false, message: ERROR_MESSAGES.MISSING_ID });
      return false;
    }
    return true;
  }

  addProduct = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const validated = productValidator.parse(req.body);

      const existingProduct = await this.ProductModel.findOne({ title : validated.title , sku : validated.sku   });
      if (existingProduct) {
        res.status(409).json({ success: false, message: ERROR_MESSAGES.PRODUCT_EXISTS });
        return;
      }

      const newProduct = new Product(validated);
      const record = await newProduct.save();

      await this.publishToKafka(record, ProductEvent.CREATE);

      res.status(201).json({success: true, message: "Thêm sản phẩm thành công", data: record });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false,error: error.errors });
      }
      next(error);
    }
  };

  editProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!this.validateProductId(id, res)) return;

      const product = await this.ProductModel.findById(id);
      if (!product) {
        res.status(404).json({ success: false, message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
        return;
      }
      const validated = productValidator.parse(req.body);

      const updatedProduct = await this.ProductModel.findByIdAndUpdate(
        id,
        { $set: validated },
        { new: true }
      );

      await this.publishToKafka(updatedProduct!, ProductEvent.UPDATE);

      res.status(200).json({ success: true, message: "Cập nhật thành công", data: updatedProduct });
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
        res.status(404).json({ success: false, message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
        return;
      }

      await this.publishToKafka(deletedProduct, ProductEvent.DELETE);

      res.status(200).json({ success: true, message: "Xóa thành công", data: deletedProduct });
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
        res.status(404).json({ success: false, message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
        return;
      }

      res.status(200).json({success: true, data: product });
    } catch (error) {
      next(error);
    }
  };

  listProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        title,
        price,
        category,
        discount,
        tags,
        brands,
        limit = 10,
        page = 1,
      }: any = req.query;
  
      const filter: FilterQuery<IProduct> = {
       
      };
  
      if (title) {
        filter.title = { $regex: title, $options: 'i' };
      }
  
      if (price) {
        const priceRange = price.split('-').map(Number);
        if (priceRange.length === 2) {
          filter.price = { $gte: priceRange[0], $lte: priceRange[1] };
        } else {
          filter.price = { $gte: priceRange[0] };
        }
      }
  
      if (category) {
        filter.category = category;
      }
  
      if (discount) {
        filter.discount = { $gte: Number(discount) };
      }
  
      if (tags) {
        filter.tags = { $in: tags.split(',') };
      }
  
      if (brands) {
        filter.brand = { $in: brands.split(',') };
      }
  
      const pageSize = Math.max(1, Number(limit));
      const currentPage = Math.max(1, Number(page));
      const skip = (currentPage - 1) * pageSize;
  
      const total = await this.ProductModel.countDocuments(filter);
      const products = await this.ProductModel
        .find(filter)
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .exec();
  
      res.status(200).json({
        success: true,
        data: products,
        pagination: {
          total,
          page: currentPage,
          limit: pageSize,
          totalCurrent: products.length,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (error) {
      next(error);
    }
  };
  
}

export default ProductController;