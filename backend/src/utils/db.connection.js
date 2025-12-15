import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";

const connectDB = async (dbUri) => {
  try {
    if (mongoose.connection.readyState === 1) return;

    const uri = dbUri || `${process.env.MONGODB_URI}/${DB_NAME}`;
    const connectionInstance = await mongoose.connect(uri);

    console.log(
      `MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MONGODB connection FAILED", error);
    process.exit(1);
  }
};

export default connectDB;
