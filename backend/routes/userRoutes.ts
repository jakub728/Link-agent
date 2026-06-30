import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { checkAdmin, checkToken } from "../middleware/checkToken";
import { type AuthenticatedRequest } from "../types/userInterface";
import User from "../model/user";
import AIConfig from "../model/prompt";

dotenv.config();
const router = express.Router();

//CHECK USER
//https://ai.sulisz.pl/user/me
router.get(
  "/me",
  checkToken,
  checkAdmin,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res
          .status(401)
          .json({ message: "Brak autoryzacji. Token jest nieprawidłowy." });
      }

      const user = await User.findById(userId)
        .populate("prompts")
        .select("-password");

      if (!user) {
        return res.status(404).json({ message: "Użytkownik nie istnieje." });
      }

      return res.status(200).json({
        id: user._id,
        login: user.login,
        prompts: user.prompts,
        role: user.role,
      });
    } catch (error) {
      console.error(error);
      next(error as any);
    }
  },
);

//LOGIN USER
//https://ai.sulisz.pl/user/login
router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { login, password } = req.body;

      if (!login || !password) {
        return res.status(400).json({ message: "Niepoprawny login lub hasło" });
      }

      const user = await User.findOne({ login }).populate("prompts");

      if (!user) {
        return res.status(401).json({ message: "Niepoprawny login lub hasło" });
      }
      const isPasswordCorrect = await bcryptjs.compare(password, user.password);

      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Niepoprawny login lub hasło" });
      }

      const tokenPayload = {
        userId: user._id,
        login: user.login,
        role: user.role,
        promptsId: user.prompts._id,
      };

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error("Brak zdefiniowanej zmiennej JWT_SECRET w pliku .env!");
      }

      const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: "1d" });

      res.cookie("auth_token", token, {
        httpOnly: true,
        sameSite: "none",
        domain: ".sulisz.pl",
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "Zalogowano pomyślnie",
        user: {
          id: user._id,
          login: user.login,
          prompts: user.prompts,
        },
      });
    } catch (error) {
      console.error(error);
      next(error as any);
    }
  },
);

//LOGOUT USER
//https://ai.sulisz.pl/user/logout
router.post(
  "/logout",
  checkToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      res.clearCookie("auth_token", {
        httpOnly: true,
        sameSite: "lax",
      });
      return res.status(200).json({ message: "Wylogowano pomyślnie" });
    } catch (error) {
      console.error(error);
      next(error as any);
    }
  },
);

//Admin create user + LOGIN_SECRET
//https://ai.sulisz.pl/user/admin-create-user
router.post(
  "/admin-create-user",
  checkToken,
  checkAdmin,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { login, password, role } = req.body;

      if (!login || !password) {
        return res.status(400).json({ message: "Login i hasło są wymagane" });
      }

      const existingUser = await User.findOne({ login });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Użytkownik o takim loginie już istnieje" });
      }

      const saltRounds = 10;
      const hashedPassword = await bcryptjs.hash(password, saltRounds);

      const userSpecificConfig = await AIConfig.create({});

      const newUser = await User.create({
        login,
        password: hashedPassword,
        role,
        prompts: userSpecificConfig._id,
      });

      return res.status(201).json({
        message: "Użytkownik utworzony",
        user: {
          id: newUser._id,
          login: newUser.login,
          password: password,
        },
      });
    } catch (error) {
      console.error(error);
      next(error as any);
    }
  },
);

export default router;
