import { Response, NextFunction, Request } from "express";
import Jwt from "../utils/jwt";
import { AuthRequest } from "../types/api";
import UserType from "../types/interface/IUser";

export const authMid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    res.status(401).json({ message: "Chưa đăng nhập" });
    return;
  }

  try {
    const jwt = new Jwt();
    const { payload } = await jwt.verifyToken(accessToken);

    if (!payload?.user || typeof payload.user !== "object") {
      throw new Error("Token không chứa thông tin user hợp lệ");
    }

    const authRequest = req as AuthRequest;
    authRequest.user = payload.user as UserType;
    next();
  } catch (error) {
    console.error("Lỗi xác thực token:", error);
    res.status(401).json({ message: "Token không hợp lệ" });
    return;
  }
};

export const autAdminMid = (req: any, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ message: "Không đủ quyền" });
    return;
  }
  next();
};