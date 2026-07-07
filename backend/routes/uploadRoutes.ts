import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import axios from "axios";
import { type AuthenticatedRequest } from "../types/userInterface";
import { checkToken } from "../middleware/checkToken";
import GeneratedData from "../model/generated";
import Account from "../model/conectedAccouts";

const router = express.Router();

router.post(
  "/upload",
  checkToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const { platform, title, content, link } = req.body;

      const userAccounts = await Account.find({ userId: userId });
    } catch (error) {
      next(error);
      console.error("Błąd podczas przesyłania danych:", error);
    }
  },
);

export default router;
