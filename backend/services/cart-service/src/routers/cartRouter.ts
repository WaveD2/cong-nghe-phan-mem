import express from "express";
import CartController from "../controllers/cartController";
const cartRouter = express.Router();

const cartController = new CartController();

cartRouter.route("/").post(cartController.addCart.bind(cartController));
cartRouter.route("/").get(cartController.getCart.bind(cartController));
cartRouter.route("/:id").get(cartController.getCart.bind(cartController));
cartRouter
  .route("/")
  .put(cartController.removeCart.bind(cartController));

export default cartRouter;
