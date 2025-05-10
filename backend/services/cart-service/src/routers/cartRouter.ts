import express from "express";
import CartController from "../controllers/cartController";
const cartRouter = express.Router();

// file tạo các tuyến đường api
const cartController = new CartController();

// tạo giỏ hàng
cartRouter.route("/").post(cartController.addCart.bind(cartController));
// lấy danh sách giỏ hàng
cartRouter.route("/").get(cartController.getCart.bind(cartController));
// lấy thông tin chi tiết giỏ hàng
cartRouter.route("/:id").get(cartController.getCart.bind(cartController));
// xóa giỏ hàng
cartRouter
  .route("/")
  .put(cartController.removeCart.bind(cartController));

export default cartRouter;
