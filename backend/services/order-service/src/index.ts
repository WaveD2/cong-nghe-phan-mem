import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import dbConnect from "./config/dbConnection";
import orderRoute from "./routers/orderRoutes";
import {authMid} from "./middlewares/authMid";
import consumeMessage from "./utils/consumeMessage";
import { errorHandler } from "./middlewares/errMiddlware";
import cors from "cors";
import Product from "./models/productModel";

config();
dbConnect();
consumeMessage();

const app = express();
const PORT = process.env.PORT || 7004;
const apiRoot = process.env.API_ROOT || "/api/order-service";

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(authMid);

app.use(apiRoot, orderRoute);
app.use(errorHandler);  

( async ()=>{
  await Product.deleteMany({})
})()

process.on("unhandledRejection", (reason, promise) => {
  console.error(" Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error(" Uncaught Exception:", err);
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
