import express, { type Response, type NextFunction } from "express";
import axios from "axios";
import { chromium } from "playwright";
import { type DataFromLink } from "../types/generatedInterface";
import { type AuthenticatedRequest } from "../types/userInterface";
import GeneratedData from "../model/generated";
import { convertAndSaveImage } from "../utils/imageConverter";
import { generateSocialContent } from "../utils/aiService";
import { checkToken } from "../middleware/checkToken";

const router = express.Router();

//Historia wpisów
//http:localhost:5000/generate/history
router.get(
  "/history",
  checkToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userHistory = await GeneratedData.find({
        author: req.user?.userId,
      });

      return res.status(200).json(userHistory);
    } catch (error) {
      console.error("Błąd pobierania historii generowania:", error);
      next(error);
    }
  },
);

//Pobieranie danych z linku
//http:localhost:5000/generate/data-from
router.post(
  "/data-from",
  checkToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      let browser;
      const { url } = req.body;

      if (!url) {
        const error = new Error("Brak URL") as any;
        error.status = 400;
        return next(error);
      }

      console.log(`Odpalam Chromium dla ${url}`);

      browser = await chromium.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      });

      const context = await browser.newContext({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      });

      const page = await context.newPage();

      await page.goto(url, { waitUntil: "commit", timeout: 20000 });

      const title = await page.title();
      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content")
        .catch(() => null);

      let ogImage = await page
        .locator('meta[property="og:image"]')
        .getAttribute("content")
        .catch(() => null);
      await browser.close();

      const responseData: DataFromLink = {
        title: title.trim(),
        link: url,
        imageUrl: ogImage || null,
        description: description || null,
      };

      console.log(`[Scraper] Sukces! Wyciągnięto: "${responseData.title}"`);
      return res.status(200).json(responseData);
    } catch (error) {
      console.error("Błąd pobierania danych z linku:", error);
      next(error);
    }
  },
);

//Generowanie treści na wszystkie sociale na raz
//http:localhost:5000/generate/content
router.post(
  "/content",
  checkToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { title, description, link, imageUrl, overwrite, model } = req.body;

      const modelLLM = model || "llama-3.1-8b-instant";

      const existinGeneration = await GeneratedData.findOne({ title: title });

      if (existinGeneration && !overwrite) {
        console.log("[Generator] Treści już istnieją\n");
        return res.status(201).json(existinGeneration);
      }

      let localJpgUrl: string | null = null;
      if (imageUrl) {
        try {
          const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
          });
          const buffer = Buffer.from(response.data);
          localJpgUrl = await convertAndSaveImage(buffer, imageUrl);

          if (!localJpgUrl) throw new Error("Konwersja zwróciła null");
        } catch (err) {
          console.error("[Generator] Błąd pobierania/konwersji obrazu:", err);
          return res.status(400).json({
            message: "Nie udało się pobrać lub przekonwertować obrazka.",
          });
        }
      }

      const aiContent = await generateSocialContent(
        req.user?.userId || "",
        title,
        description || "",
        link,
        localJpgUrl,
        modelLLM,
      );

      const updateData: Record<string, any> = {
        title,
        description,
        link,
        imageUrl: localJpgUrl,
        categories: aiContent.categories,
        author: req.user?.userId,

        // FACEBOOK
        "facebook.title": aiContent.facebook?.title,
        "facebook.content": aiContent.facebook?.content,

        // LINKEDIN
        "linkedin.title": aiContent.linkedin?.title,
        "linkedin.content": aiContent.linkedin?.content,

        // X (TWITTER)
        "x.title": aiContent.x?.title,
        "x.content": aiContent.x?.content,

        // REDDIT
        "reddit.title": aiContent.reddit?.title,
        "reddit.content": aiContent.reddit?.content,

        // WYKOP
        "wykop.title": aiContent.wykop?.title,
        "wykop.content": aiContent.wykop?.content,

        // DISCORD
        "discord.title": aiContent.discord?.title,
        "discord.content": aiContent.discord?.content,

        // TELEGRAM
        "telegram.title": aiContent.telegram?.title,
        "telegram.content": aiContent.telegram?.content,
      };

      const updatedGeneration = await GeneratedData.findOneAndUpdate(
        { title: title },
        { $set: updateData },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );

      console.log(`[Generator] Sukces! Zapisano dane dla artykułu: "${title}"`);
      return res.status(200).json(updatedGeneration);
    } catch (error: any) {
      console.error("Błąd generowania socialów:", error);
      next(error);
    }
  },
);

export default router;
