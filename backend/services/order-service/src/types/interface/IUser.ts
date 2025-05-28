import { Document } from "mongoose";

export default interface UserType extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user'; 
  avatar: string
}
