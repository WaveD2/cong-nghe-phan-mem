import { Router, Request, Response, NextFunction } from "express";
import OrderController from "../controllers/orderController";
import { authMid, autAdminMid} from "../middlewares/authMid";
import { AuthRequest } from "../types/api";

const router = Router();
const orderController = new OrderController();

// User routes
router.post("/", authMid, (req: Request, res: Response, next: NextFunction) => 
  orderController.createOrder(req as AuthRequest, res, next));
router.get("/:id", authMid, (req: Request, res: Response, next: NextFunction) => 
  orderController.getSingleOrder(req as AuthRequest, res, next));
router.get("/", authMid, (req: Request, res: Response, next: NextFunction) => 
  orderController.getAllOrders(req as AuthRequest, res, next));
router.put("/:id", authMid, (req: Request, res: Response, next: NextFunction) => 
  orderController.updateOrder(req as AuthRequest, res, next));
router.delete("/:id", authMid, (req: Request, res: Response, next: NextFunction) => 
  orderController.deleteOrder(req as AuthRequest, res, next));
router.patch("/:id/cancel", authMid, (req: Request, res: Response, next: NextFunction) => 
  orderController.cancelOrder(req as AuthRequest, res, next));

// Admin routes
router.get("/admin/all", authMid, autAdminMid, (req: Request, res: Response, next: NextFunction) => 
  orderController.getAllOrdersAdmin(req as AuthRequest, res, next));
router.put("/admin/:id/status", authMid, autAdminMid, (req: Request, res: Response, next: NextFunction) => 
  orderController.updateOrderStatusAdmin(req as AuthRequest, res, next));
router.get("/admin/report", authMid, autAdminMid, (req: Request, res: Response, next: NextFunction) => 
  orderController.getOrderReportAdmin(req as AuthRequest, res, next));

export default router;