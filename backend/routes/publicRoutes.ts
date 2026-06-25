import express from "express";
import path from "path";
import fs from "fs";
import { type AuthenticatedRequest } from "../types/userInterface";
import { checkToken } from "../middleware/checkToken";

const router = express.Router();

//Generowanie treści na wszystkie sociale na raz
//http:localhost:5000/public/uploads/11111.jpg
router.get("/uploads/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(process.cwd(), "public/uploads", filename);

  if (!fs.existsSync(filePath)) {
    return res
      .status(404)
      .send(`Plik ${filename} nadal nie istnieje pod ścieżką: ${filePath}`);
  }

  res.sendFile(filePath);
});

export default router;
