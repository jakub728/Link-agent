import { type Request, type Response, type NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Brak dostępu" });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.LOGIN_SECRET;

  if (!secret || token !== secret) {
    return res.status(403).json({
      message: "Nieprawidłowy token",
    });
  }

  next();
}

