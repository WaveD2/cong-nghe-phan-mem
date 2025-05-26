import { connect } from "mongoose";
import { config } from "dotenv";
config();

export default async function dbConnect() {
  const mongoUrl = process.env.MONGODB_URI;
  console.log("mongoUrl:::", mongoUrl);
  
  if (!mongoUrl) {
    throw new Error("MONGODB_URI is not defined in the environment variables");
  }

  await connect(mongoUrl)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error while connecting to MongoDB:", err);
    });
}
