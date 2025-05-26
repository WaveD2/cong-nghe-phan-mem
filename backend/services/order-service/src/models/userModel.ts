import mongoose, { Schema, Document } from "mongoose";
import UserType from "../types/interface/IUser";

const userSchema = new Schema<UserType>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

const User = mongoose.model<UserType>("user", userSchema);

export default User;
