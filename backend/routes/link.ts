import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import axios from "axios";
import { chromium } from "playwright";
import { type DataFromLink } from "../types/generatedInterface";
import AIConfig from "../model/prompt";
import GeneratedData from "../model/generated";
import { convertAndSaveImage } from "../utils/imageConverter";
import { generateSocialContent } from "../utils/aiService";

const router = express.Router();

//Pobieranie danych z linku
router.post(
  "/from-link",
  async (req: Request, res: Response, next: NextFunction) => {
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

//? Pobierz prompty
// http://localhost:5000/link/get-prompt
router.get(
  "/get-prompt",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Pobieram prompty");

      let prompts = await AIConfig.findOne();

      if (!prompts) {
        prompts = new AIConfig();
        await prompts.save();
      }

      return res.status(200).json({
        message: "Pobrano prompty",
        prompts: prompts,
      });
    } catch (error: any) {
      console.error("Błąd pobierania promptów:", error);
      next(error);
    }
  },
);

//? Zmiana promptów
// http://localhost:5000/link/edit-prompt
router.post(
  "/edit-prompt",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
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

      const updatedPrompts = await AIConfig.findOneAndUpdate(
        {},
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
        prompts: updatedPrompts,
      });
    } catch (error: any) {
      console.error("Błąd edytowania promptów:", error);
      next(error);
    }
  },
);

//Generowanie treści na wszystkie sociale na raz
router.post(
  "/generate-content",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, link, imageUrl } = req.body;

      console.log(`[Generator] Rozpoczynam proces dla artykułu: ${title}\n`);
      const existinGeneration = await GeneratedData.findOne({ title: title });
      if (existinGeneration) {
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
          localJpgUrl = await convertAndSaveImage(buffer);

          if (!localJpgUrl) throw new Error("Konwersja zwróciła null");
        } catch (err) {
          console.error("[Generator] Błąd pobierania/konwersji obrazu:", err);
          return res.status(400).json({
            message: "Nie udało się pobrać lub przekonwertować obrazka.",
          });
        }
      }

      console.log("[AI] Generowanie treści przez model LLM...\n");
      const aiContent = await generateSocialContent(
        title,
        description || "",
        link,
        localJpgUrl,
      );

      const newGeneration = await GeneratedData.create({
        title,
        description,
        link,
        imageUrl: localJpgUrl,
        categories: aiContent.categories,
        x: aiContent.x,
        facebook: aiContent.facebook,
        linkedin: aiContent.linkedin,
        reddit: aiContent.reddit,
        wykop: aiContent.wykop,
        discord: aiContent.discord,
        telegram: aiContent.telegram,
      });
      console.log(`[Generator] Sukces! Utworzono sociale dla: "${title}"`);

      return res.status(200).json(newGeneration);
    } catch (error: any) {
      console.error("Błąd generowania socialów:", error);
      next(error);
    }
  },
);

export default router;
