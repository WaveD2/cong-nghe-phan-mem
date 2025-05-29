import { Document } from "mongoose";

export default interface ProductType extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  img: string;
  category: string;
  categorySlug: string;
  sold: number;
}
