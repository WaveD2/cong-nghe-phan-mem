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
import Order from "./models/orderModel";
import Cart from "./models/cartModel";

config();
dbConnect();
consumeMessage();

const app = express();
const PORT = process.env.PORT || 7004;
const apiRoot = process.env.API_ROOT || "/api/order-service";

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:514',
  'https://cnpm-gamma.vercel.app',
  'https://cnpm-waved2s-projects.vercel.app',
  'https://cnpm-waved2s-projects.vercel.app/',
  'https://cnpm-gamma.vercel.app/'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Không cho phép CORS từ origin này: ' + origin));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(authMid);

app.use(apiRoot, orderRoute);
app.use(errorHandler);  

( async ()=>{
  // await Product.deleteMany({})
  // await Order.deleteMany({})
  // await Cart.deleteMany({})
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
