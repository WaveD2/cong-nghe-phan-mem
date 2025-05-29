import { Document } from "mongoose";

export default interface ProductType extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  img :string;
  category: { type: String, required: true },
  categorySlug: { type: String, required: true },
  sold: { type: Number, default: 0 };
}
