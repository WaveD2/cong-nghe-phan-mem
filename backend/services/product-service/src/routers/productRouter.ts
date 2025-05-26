import express from "express";
import ProductController from "../controllers/productController";
import { authMid, autAdminMid } from "../middlewares/authMid";
const productRouter = express.Router();
const productController = new ProductController();


productRouter
  .route("/")
  .get(productController.listProduct.bind(productController));

productRouter
  .route("/:id")
  .get(productController.detailProduct.bind(productController));
productRouter
  .route("/")
  .post(authMid,autAdminMid,productController.addProduct.bind(productController));
productRouter
  .route("/:id")
  .put(authMid,autAdminMid,productController.editProduct.bind(productController));
productRouter
  .route("/:id")
  .delete(authMid, autAdminMid,productController.deleteProduct.bind(productController));

export default productRouter;
