import express from "express";
import ProductController from "../controllers/productController";
const productRouter = express.Router();
const productController = new ProductController();

productRouter
  .route("/")
  .post(productController.addProduct.bind(productController));
productRouter
  .route("/:id")
  .put(productController.editProduct.bind(productController));
productRouter
  .route("/:id")
  .get(productController.detailProduct.bind(productController));
productRouter
  .route("/:id")
  .delete(productController.deleteProduct.bind(productController));

export default productRouter;
