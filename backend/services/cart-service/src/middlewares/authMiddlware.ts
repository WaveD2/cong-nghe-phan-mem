import { NextFunction, Response } from "express";
import Jwt from "../utils/jwt";
import { AuthRequest } from "../types/api";
import jwtPayload from "../types/jwt";

// lớp bảo vệ : xác thực người dùng
const authMid = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.jwtToken;  
  if (!token) {
    res.status(400);
    throw new Error("Thiếu giá trị token");
  } else {
    const jwt = new Jwt();
    const {
      payload: { userId },
    }: jwtPayload = await jwt.verifyToken(token);
    (req.user = userId), next();
  }
};

export default authMid;
