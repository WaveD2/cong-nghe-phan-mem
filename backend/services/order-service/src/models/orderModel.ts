import mongoose, { Schema } from "mongoose";
import { IAddress, IOrder, IOrderItem } from "../types/interface/IOrder";

const OrderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled" , "completed"],
    default: "pending",
  },
});

OrderItemSchema.index({ productId: 1, status: 1 });


const AddressSchema = new Schema<IAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  detail : { type: String },
});

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    items: [OrderItemSchema],
    shippingAddress: AddressSchema,
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled", "completed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "momo", "zalopay", "vnpay", "paypal", "stripe", "bank_transfer", "credit_card"],
      default: "cod",
    },
    isDelivered: { type: Boolean, default: false },
    isPaid: { type: Boolean, default: false },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    shippedDate: {
      type: Date,
    },
    deliveryDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, status: 1 });


const Order = mongoose.model<IOrder>("order", orderSchema);

export default Order;
