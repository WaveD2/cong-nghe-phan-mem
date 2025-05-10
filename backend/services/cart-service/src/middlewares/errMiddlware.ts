import { Request, Response, NextFunction } from "express";

// lớp bảo vệ : bắt tất các lỗi mà server có thể có
// nhằm mục đích không server bị chết
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("🔥 Error errorHandler:", err);

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
}
