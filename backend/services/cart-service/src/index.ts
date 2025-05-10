import express from 'express'
import { config } from 'dotenv';
import dbConnect from './config/dbConnection';
import cookieParser from "cookie-parser";
import authMid from './middlewares/authMiddlware';
import cartRouter from './routers/cartRouter';
import consumeMessage from './utils/consumeMessage';
import { errorHandler } from './middlewares/errMiddlware';

config()
dbConnect();
consumeMessage()

const app = express();
const PORT = process.env.PORT || 7003;
const apiRoot = process.env.API_ROOT || "/api/cart-service";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(authMid);

app.use(apiRoot, cartRouter);


app.use(errorHandler);  

process.on("unhandledRejection", (reason, promise) => {
  console.error(" Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error(" Uncaught Exception:", err);
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
