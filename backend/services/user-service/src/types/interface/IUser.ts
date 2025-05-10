import { Document } from "mongoose";

export interface UserType extends Document {
  userId: number;
  name: string;
  email: string;
  password: string;
}
