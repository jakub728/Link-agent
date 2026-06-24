import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { checkAdmin, checkToken } from "../middleware/checkToken";
import User from "../model/user";
import AIConfig from "../model/prompt";

dotenv.config();
const router = express.Router();

//LOGIN USER
//http://localhost:5000/user/login
router.post(
  "/login",
  checkToken,
  checkAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { login, password } = req.body;

      if (!login || !password) {
        return res.status(400).json({ message: "Login i hasło są wymagane" });
      }

      const user = await User.findOne({ login }).populate("prompts");

      if (!user) {
        return res.status(401).json({ message: "Login i hasło są wymagane" });
      }
      const isPasswordCorrect = await bcryptjs.compare(password, user.password);

      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Login i hasło są wymagane" });
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
        sameSite: "lax",
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
//http://localhost:5000/user/logout
router.post(
  "/logout",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error) {
      console.error(error);
      next(error as any);
    }
  },
);

//Admin create user + LOGIN_SECRET
//http://localhost:5000/user/admin-create-user
router.post(
  "/admin-create-user",
  async (req: Request, res: Response, next: NextFunction) => {
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
