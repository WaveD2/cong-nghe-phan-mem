import express from "express";
import CartController from "../controllers/cartController";

const cartRouter = express.Router();
const cartController = new CartController();

cartRouter.post("/", cartController.addCart.bind(cartController));

cartRouter.get("/", cartController.getCart.bind(cartController));

cartRouter.get("/:id", cartController.get.bind(cartController));

cartRouter.put("/quantity", cartController.updateCartItemQuantity.bind(cartController));

cartRouter.delete("/item", cartController.removeCart.bind(cartController));

cartRouter.delete("/", cartController.clearCart.bind(cartController));

cartRouter.get("/status", cartController.checkCartStatus.bind(cartController));

cartRouter.get("/all", cartController.getAllCarts.bind(cartController));

export default cartRouter;