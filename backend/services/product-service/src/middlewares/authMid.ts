import { Response, NextFunction } from "express";
import Jwt from "../utils/jwt";
import { AuthRequest } from "../types/api";

export const authMid = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    res.status(401).json({ message: "Chưa đăng nhập" });
    return;  
  }

  try {
    const jwt = new Jwt();
    const { payload }: any = await jwt.verifyToken(accessToken);

    if (!payload?.user) {
      throw new Error("Token không chứa user");
    }

    req.user = payload.user;
    return next(); 
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
    return; 
  }
};



export const autAdminMid = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "admin") {
     res.status(403).json({ message: "Không đủ quyền" });
     return;
  }
  next();
};
