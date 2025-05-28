import { Document } from "mongoose";

export interface ProductType extends Document {
  name: String;
  description: String;
  price: Number;
  stock: Number;
  img: String;
}
