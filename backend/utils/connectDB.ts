import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    if (!process.env.DB_URI) {
      throw new Error("Missing DB_URI in environment variables");
    }

    await mongoose.connect(process.env.DB_URI);
    console.log(
      `Database connected: ${process.env.DB_URI.slice(68, 78)} cluster`,
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Database connection error: ${error.message}`);
    } else {
      console.error("An unknown database error occurred", error);
    }
  }
};
