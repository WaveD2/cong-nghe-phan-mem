import mongoose, { Schema } from "mongoose";
import ProductType from "../types/interface/IProduct";
// file định nghĩa cấu trúc dữ liệu cho cơ sở dữ liệu
const productSchema = new Schema<ProductType>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    img: { type: String, required: true },
  },
  { timestamps: true }
);

const Product = mongoose.model<ProductType>("product", productSchema);

export default Product;
