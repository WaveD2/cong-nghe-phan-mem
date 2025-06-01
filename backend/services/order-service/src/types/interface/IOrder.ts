import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export interface IOrderItem {
  productId: ObjectId;
  name: string;
  quantity: number;
  price: number;
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled" | "Completed"; 
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  detail?: string;
}

export interface IOrder extends Document {
  userId: ObjectId;
  items: IOrderItem[];
  shippingAddress: IAddress;
  totalAmount: number;
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled"| "Completed";
  paymentMethod: string;
  isPaid: boolean;
  isDelivered: boolean;
    orderDate?: Date;
    shippedDate?: Date | null;
    deliveryDate: Date;
}
