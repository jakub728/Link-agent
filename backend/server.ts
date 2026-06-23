import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { ZodError } from "zod";
import linkRouter from "./routes/link";
import { connectDB } from "./utils/connectDB";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const connect = async () => {
  await connectDB();
};
connect()
  .then(() => console.log("Próba połączenia zainicjowana..."))
  .catch((err) => console.error("Błąd podczas inicjalizacji:", err));

//! MIDDLEWARE
dotenv.config();
app.use(cors());
app.use(express.json());

app.use("/link", linkRouter);
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
