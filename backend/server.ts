import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { ZodError } from "zod";
import { connectDB } from "./utils/connectDB";
import publicRouter from "./routes/publicRoutes";
import generateRouter from "./routes/generateRoutes";
import userRouter from "./routes/userRoutes";
import promptRouter from "./routes/promptsRoutes";
import connectAccountsRouter from "./routes/accountsRoutes";
import uploadRouter from "./routes/uploadRoutes";

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

const allowedOrigins = [
  "http://localhost:5173",
  "https://satkurier-ai-gamma.vercel.app",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: Origin ${origin} not allowed.`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(cookieParser());

//! ROUTY
app.use("/public", publicRouter);
app.use("/user", userRouter);
app.use("/prompt", promptRouter);
app.use("/generate", generateRouter);
app.use("/connect/account", connectAccountsRouter);
app.use("/upload", uploadRouter);

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
