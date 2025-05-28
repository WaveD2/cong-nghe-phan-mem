import express from "express";
import { config } from "dotenv";
import dbConnect from "./config/dbConnection";
import productRouter from "./routers/productRouter";
import consumeMessage from "./utils/consumeMessage";
import { errorHandler } from "./middlewares/errMiddlware";
import cookieParser from "cookie-parser";
import { seedProduct } from "./script";
import cors from "cors";

config();
dbConnect();
consumeMessage() // Calling All Timee (Kafka Consume Fun)

const app = express();
const PORT = process.env.PORT || 7002;
const apiRoot = process.env.API_ROOT || "/api/product-service";

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(apiRoot, productRouter);

app.use(errorHandler);  
// (async() => {
//   await seedProduct()
// })()
process.on("unhandledRejection", (reason, promise) => {
  console.error(" Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error(" Uncaught Exception:", err);
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
