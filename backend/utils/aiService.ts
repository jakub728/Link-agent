import {
  type ISocialPost,
  type GeneratingInterface,
} from "../types/generatedInterface";
import AIConfig from "../model/prompt";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { Types } from "mongoose";
import { sanitizeLLMText } from "../utils/sanitizeAIText";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface ILLMRawOutput {
  author: Types.ObjectId | string;
  categories: string[];
  x: { title: string; content: string };
  facebook: { title: string; content: string };
  linkedin: { title: string; content: string };
  reddit: { title: string; content: string; subreddit: string[] };
  wykop: { title: string; content: string };
  discord: { title: string; content: string };
  telegram: { title: string; content: string };
}

export async function generateSocialContent(
  author: string | Types.ObjectId,
  title: string,
  description: string | null,
  link: string,
  imageUrl: string | null,
  modelLLM: string,
): Promise<GeneratingInterface> {
  let configDb = await AIConfig.findOne();
  if (!configDb) {
    configDb = await AIConfig.create({});
  }

  const prompt = `
    ${configDb.systemPrompt}

    Tytuł artykułu: ${title}
    Opis artykułu: ${description || ""}

    Dozwolone kategorie do wyboru (wybierz od 1 do 3 najbardziej pasujących z tej listy):
    ${configDb.allowedCategories.map((cat) => `"${cat}"`).join(", ")}.

    Zwróć wynik jako obiekt JSON zgodny z poniższymi wytycznymi dla każdej platformy:
    - x: Tytuł: ${configDb.x.titleDescription} | Treść: ${configDb.x.contentDescription}
    - facebook: Tytuł: ${configDb.facebook.titleDescription} | Treść: ${configDb.facebook.contentDescription}
    - linkedin: Tytuł: ${configDb.linkedin.titleDescription} | Treść: ${configDb.linkedin.contentDescription}
    - reddit: Tytuł: ${configDb.reddit.titleDescription} | Treść: ${configDb.reddit.contentDescription} | subreddity: ${configDb.reddit.subredditDescription}
    - wykop: Tytuł: ${configDb.wykop.titleDescription} | Treść: ${configDb.wykop.contentDescription}
    - discord: Tytuł: ${configDb.discord.titleDescription} | Treść: ${configDb.discord.contentDescription}
    - telegram: Tytuł: ${configDb.telegram.titleDescription} | Treść: ${configDb.telegram.contentDescription}

    Musisz ściśle trzymać się następującej struktury JSON:
    {
      "categories": ["kategoria1", "kategoria2"],
      "x": { "title": "...", "content": "..." },
      "facebook": { "title": "...", "content": "..." },
      "linkedin": { "title": "...", "content": "..." },
      "reddit": { "title": "...", "content": "...", "subreddit": ["sub1", "sub2"] },
      "wykop": { "title": "...", "content": "..." },
      "discord": { "title": "...", "content": "..." },
      "telegram": { "title": "...", "content": "..." }
    }
  `;

  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: modelLLM,
      response_format: { type: "json_object" },
    });

    const responseText = response.choices[0]?.message?.content;

    if (responseText) {
      const rawData: ILLMRawOutput = JSON.parse(responseText);

      const mapToSocialPost = (platformData: {
        title: string;
        content: string;
      }): ISocialPost => ({
        title: sanitizeLLMText(platformData.title) || "",
        content: sanitizeLLMText(platformData.content) || "",
        uploaded: [],
        additional_photo: null,
      });

      const finalOutput: GeneratingInterface = {
        author: author,
        title,
        description,
        link,
        imageUrl,
        categories: rawData.categories || [],
        x: mapToSocialPost(rawData.x),
        facebook: mapToSocialPost(rawData.facebook),
        linkedin: mapToSocialPost(rawData.linkedin),
        reddit: {
          ...mapToSocialPost(rawData.reddit),
          subreddit: rawData.reddit?.subreddit || [],
        },
        wykop: mapToSocialPost(rawData.wykop),
        discord: mapToSocialPost(rawData.discord),
        telegram: mapToSocialPost(rawData.telegram),
      };

      return finalOutput;
    }

    throw new Error("Model z Groq zwrócił pustą odpowiedź");
  } catch (error) {
    console.error("Błąd podczas generowania treści przez Groq:", error);
    throw error;
  }
}
