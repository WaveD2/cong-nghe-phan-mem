import { connect } from "mongoose";

export default async function dbConnect() {
  const mongoUrl = "mongodb+srv://tungdev64:WRwOgHdNiqCdfbLb@shop.ry7alok.mongodb.net";

  try {
    if (!mongoUrl) {
      throw new Error("MONGO_URL is not defined in the environment variables");
    }

    await connect(mongoUrl)
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((err) => {
        console.error("Error while connecting to MongoDB:", err.message);
      });
  } catch (error) {
    console.log(error);
  }
}
