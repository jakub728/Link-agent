import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AIConfig from "../model/prompt";
import {type AuthenticatedRequest} from "../types/userInterface"


export async function checkToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Brak autoryzacji. Zaloguj się." });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("Brak zdefiniowanej zmiennej JWT_SECRET w pliku .env!");
    }

    const decoded = jwt.verify(token, jwtSecret) as any;

    const configDb = await AIConfig.findById(decoded.promptsId);
    if (!configDb) {
      return res.status(404).json({
        message: "Nie znaleziono konfiguracji promptów dla Twojego konta.",
      });
    }

    req.user = {
      userId: decoded.userId,
      login: decoded.login,
      role: decoded.role,
    };
    req.userConfig = configDb;

    next();
  } catch (error) {
    console.error("[Auth Middleware Error]:", error);
    return res.status(401).json({
      message: "Sesja wygasła lub jest niepoprawna. Zaloguj się ponownie.",
    });
  }
}

export function checkAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return res.status(401).json({ message: "Brak autoryzacji." });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Dostęp zabroniony. Wymagane uprawnienia administratora.",
    });
  }

  next();
}
