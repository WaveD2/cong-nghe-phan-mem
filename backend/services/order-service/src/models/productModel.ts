import mongoose, { Schema } from "mongoose";
import ProductType from "../types/interface/IProduct";

const productSchema = new Schema<ProductType>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    img : { type: String, required: true },
    category: { type: String, required: true },
    categorySlug: { type: String, required: true },
    sold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model<ProductType>("product", productSchema);

export default Product;
