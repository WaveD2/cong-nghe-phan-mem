import { Document, Types } from "mongoose";
import IProduct from "./IProduct";
import IUser from "./IUser";

export interface CartItem {
  productId: string;
  quantity: number;
}

export default interface ICart extends Document {
  userId: string | IUser;
  items: CartItem[];
}
