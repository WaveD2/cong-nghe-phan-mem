import { Document } from "mongoose";

export default interface UserType extends Document {
  userId: number;
  name: string;
  email: string;
  password: string;
}
