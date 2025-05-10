import mongoose, { Schema, Document } from "mongoose";
import UserType from "../types/interface/IUser";

const userSchema = new Schema<UserType>(
  {
    userId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model<UserType>("user", userSchema);

export default User;
