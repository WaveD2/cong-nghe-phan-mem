import express from "express";
import { config } from "dotenv";
import dbConnect from "./config/dbConnection";
import userRoute from "./routes/userRoute";
import { errorHandler } from "./middleware/errMiddlware";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectRedis } from "./redis";
import { setupMail } from "./utils/email";
config();
dbConnect();

const app = express();
const PORT = process.env.PORT || 7001;
const apiRoot = process.env.API_ROOT || "/api/user-service";

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:514',
  'https://cnpm-gamma.vercel.app'
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

setupMail();;
connectRedis();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(apiRoot, userRoute);

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
