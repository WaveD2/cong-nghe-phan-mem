import mongoose, { Schema } from "mongoose";
import ICart from "../types/interface/ICart";

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],
  },
  { timestamps: true }
);

const Cart = mongoose.model<ICart>("cart", cartSchema);

export default Cart;
