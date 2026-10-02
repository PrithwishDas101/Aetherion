import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import { logSafeError } from "../utils/safeLogging.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Chat.createIndexes();

    console.log("MongoDB connected");
  } catch (error) {
    logSafeError("Database connection", error);
    process.exit(1);
  }
};

export default connectDB;
