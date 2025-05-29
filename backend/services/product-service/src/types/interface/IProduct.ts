import { Document } from "mongoose";

export interface ProductType extends Document {
  name: String;
  description: String;
  price: Number;
  stock: Number;
  img: String;
  category: String;
  categorySlug: String;
  sold: Number;
}
