import express from "express";
import OrderController from "../controllers/orderController";
const orderRoute = express.Router();

const orederController = new OrderController();

orderRoute
  .route("/")
  .post(orederController.createOrder.bind(orederController));

orderRoute
  .route("/:id")
  .get(orederController.getSingleOrder.bind(orederController));

orderRoute
  .route("/")
  .get(orederController.getAllOrders.bind(orederController));

export default orderRoute;
