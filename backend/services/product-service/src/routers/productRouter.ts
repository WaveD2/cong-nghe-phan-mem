import express from "express";
import ProductController from "../controllers/productController";
const productRouter = express.Router();
const productController = new ProductController();

// TẠO SẢN PHẨM
productRouter
  .route("/")
  .post(productController.addProduct.bind(productController));
// LẤY DANH SÁCH SẢN PHẨM
productRouter
  .route("/")
  .get(productController.listProduct.bind(productController));
// CẬP NHẬT SẢN PHẨM
productRouter
  .route("/:id")
  .put(productController.editProduct.bind(productController));
// LẤY THÔNG TIN CHI TIẾT SẢN PHẨM
productRouter
  .route("/:id")
  .get(productController.detailProduct.bind(productController));
// XÓA SẢN PHẨM
productRouter
  .route("/:id")
  .delete(productController.deleteProduct.bind(productController));

export default productRouter;
