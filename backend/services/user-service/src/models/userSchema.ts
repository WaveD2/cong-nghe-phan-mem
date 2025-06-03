import mongoose, { Schema, Document } from "mongoose";
import { UserType } from "../types/interface/IUser";

const userSchema = new Schema<UserType>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" }, //admin || user
    phone : { type: String, required: true }, 
    avatar: { type: String, default: "https://images.pexels.com/photos/13288544/pexels-photo-13288544.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" },
  },
  {
    timestamps: true,
    // toJSON: {
    //   transform(doc, ret) {
    //     delete ret.password;
    //     delete ret.__v;
    //     return ret;
    //   },
    // },
    // toObject: {
    //   transform(doc, ret) {
    //     delete ret.password;
    //     delete ret.__v;
    //     return ret;
    //   },
    // },
  }
);

const User = mongoose.model<UserType>("user", userSchema);

export default User;
