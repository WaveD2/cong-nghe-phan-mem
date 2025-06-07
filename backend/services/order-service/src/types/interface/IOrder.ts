import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export interface IOrderItem {
  productId: ObjectId;
  name: string;
  quantity: number;
  price: number;
  status: "pending" | "shipped" | "delivered" | "cancelled"| "completed";
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
  status: "pending" | "shipped" | "delivered" | "cancelled"| "completed";
  paymentMethod:  'cod'| 'momo'| 'zalopay'| 'vnpay'| 'paypal'| 'stripe'| 'bank_transfer'| 'credit_card';
  isPaid: boolean;
  isDelivered: boolean;
    orderDate?: Date;
    shippedDate?: Date | null;
    deliveryDate: Date;
}
