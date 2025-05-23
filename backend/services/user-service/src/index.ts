import express from "express";
import { config } from "dotenv";
import dbConnect from "./config/dbConnection";
import userRoute from "./routes/userRoute";
import { errorHandler } from "./middleware/errMiddlware";

config();
dbConnect();

const app = express();
const PORT = process.env.PORT || 7001;
const apiRoot = process.env.API_ROOT || "/api/user-service";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
