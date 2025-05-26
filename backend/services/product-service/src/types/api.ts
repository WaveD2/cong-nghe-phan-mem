import { Request } from "express";
import UserType from "./interface/IUser";

export interface AuthRequest extends Request {
  user?: UserType;
}
