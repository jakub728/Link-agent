import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import { ZodError } from "zod";
import { connectDB } from "./utils/connectDB";
import generateRouter from "./routes/generateRoutes";
import userRouter from "./routes/userRoutes";
import promptRouter from "./routes/promptsRoutes";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const connect = async () => {
  await connectDB();
};
connect()
  .then(() => console.log("Połączono z bazą danych."))
  .catch((err) => console.error("Błąd podczas łączenia z bazą danych:", err));

//! MIDDLEWARE
dotenv.config();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

//! ROUTY
app.use("/user", userRouter);
app.use("/prompt", promptRouter);
app.use("/generate", generateRouter);
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

//! GLOBAL ERROR HANDLER
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation Error",
      errors: err.issues,
    });
  }
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

//! START THE SERVER
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
