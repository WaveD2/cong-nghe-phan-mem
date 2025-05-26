import { NextFunction, Response } from "express";
import Jwt from "../utils/jwt";
import { AuthRequest } from "../types/api";
import jwtPayload from "../types/jwt";

export const authMid = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.jwtToken;

  if (!token) {
    res.status(400).json({ message: "Không có token" });
    return
  } else {
    const jwt = new Jwt();
    // @ts-ignore
    const { payload: { user }}: jwtPayload = await jwt.verifyToken(token);
    (req.user = user), next();
  }
};



export const autAdminMid = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.jwtToken;

  if (!token) {
    res.status(400);
    throw new Error("Không có token");
  } else {
    const jwt = new Jwt();
    // @ts-ignore
    const { payload: { user }}: jwtPayload = await jwt.verifyToken(token);
    if(user?.role !== 'admin') {
      res.status(400);
      throw new Error("Không phải admin");
    }
    (req.user = user), next();
  }
};
