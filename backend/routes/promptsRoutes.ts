import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { type AuthenticatedRequest } from "../types/userInterface";
import AIConfig from "../model/prompt";
import { checkToken } from "../middleware/checkToken";

const router = express.Router();

//?GET PROMPTY
// http://localhost:5000/prompt/get-prompt
router.get(
  "/get-prompt",
  checkToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      return res.status(200).json({
        message: "Pobrano prompty",
        prompts: req.userConfig,
      });
    } catch (error: any) {
      console.error("Błąd pobierania promptów:", error);
      next(error);
    }
  },
);

//?POST PROMPTY
// http://localhost:5000/prompt/edit-prompt
router.put(
  "/edit-prompt",
  checkToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const configId = req.userConfig?._id;

      if (!configId) {
        return res
          .status(404)
          .json({ message: "Nie znaleziono konfiguracji do zaktualizowania." });
      }
      const {
        systemPrompt,
        allowedCategories,
        x,
        facebook,
        linkedin,
        reddit,
        wykop,
        discord,
        telegram,
      } = req.body;

      await AIConfig.findByIdAndUpdate(
        configId,
        {
          systemPrompt,
          allowedCategories,
          x,
          facebook,
          linkedin,
          reddit,
          wykop,
          discord,
          telegram,
        },
        { new: true, upsert: true, runValidators: true },
      );

      return res.status(200).json({
        message: "Konfiguracja pól oraz promptu AI została zaktualizowana!",
      });
    } catch (error: any) {
      console.error("Błąd edytowania promptów:", error);
      next(error);
    }
  },
);

export default router;
