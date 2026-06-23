import { GoogleGenAI, Type } from "@google/genai";
import {
  type ISocialPost,
  type GeneratingInterface,
} from "../types/generatedInterface";
import AIConfig from "../model/prompt";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

export async function generateSocialContent(
  title: string,
  description: string | null,
  link: string,
  imageUrl: string | null,
): Promise<GeneratingInterface> {
  let configDb = await AIConfig.findOne();
  if (!configDb) {
    configDb = await AIConfig.create({});
  }

  const prompt = `
    ${configDb.systemPrompt}

    Tytuł: ${title}
    Opis: ${description || ""}

    Dozwolone kategorie do wyboru (wybierz tylko najbardziej pasujące):
    ${configDb.allowedCategories.map((cat) => `"${cat}"`).join(", ")}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            x: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: configDb.x.titleDescription,
                },
                content: {
                  type: Type.STRING,
                  description: configDb.x.contentDescription,
                },
              },
              required: ["title", "content"],
            },
            facebook: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: configDb.facebook.titleDescription,
                },
                content: {
                  type: Type.STRING,
                  description: configDb.facebook.contentDescription,
                },
              },
              required: ["title", "content"],
            },
            linkedin: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: configDb.linkedin.titleDescription,
                },
                content: {
                  type: Type.STRING,
                  description: configDb.linkedin.contentDescription,
                },
              },
              required: ["title", "content"],
            },
            reddit: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: configDb.reddit.titleDescription,
                },
                content: {
                  type: Type.STRING,
                  description: configDb.reddit.contentDescription,
                },
                subreddit: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: configDb.reddit.subredditDescription,
                },
              },
              required: ["title", "content", "subreddit"],
            },
            wykop: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: configDb.wykop.titleDescription,
                },
                content: {
                  type: Type.STRING,
                  description: configDb.wykop.contentDescription,
                },
              },
              required: ["title", "content"],
            },
            discord: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: configDb.discord.titleDescription,
                },
                content: {
                  type: Type.STRING,
                  description: configDb.discord.contentDescription,
                },
              },
              required: ["title", "content"],
            },
            telegram: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: configDb.telegram.titleDescription,
                },
                content: {
                  type: Type.STRING,
                  description: configDb.telegram.contentDescription,
                },
              },
              required: ["title", "content"],
            },
            categories: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "Tablica 1-3 kategorii przypisanych do artykułu z dozwolonej puli",
            },
          },
          required: [
            "x",
            "facebook",
            "linkedin",
            "reddit",
            "wykop",
            "discord",
            "telegram",
            "categories",
          ],
        },
      },
    });

    if (response.text) {
      const rawData: GeneratingInterface = JSON.parse(response.text);

      const mapToSocialPost = (platformData: {
        title: string;
        content: string;
      }): ISocialPost => ({
        title: platformData.title,
        content: platformData.content,
        uploaded: false,
        additional_photo: null,
      });

      // DODANE: Pola wymagane przez DataFromLink (wchodzące w skład GeneratingInterface)
      const finalOutput: GeneratingInterface = {
        title,
        description,
        link,
        imageUrl,
        categories: rawData.categories,
        x: mapToSocialPost(rawData.x),
        facebook: mapToSocialPost(rawData.facebook),
        linkedin: mapToSocialPost(rawData.linkedin),
        reddit: {
          ...mapToSocialPost(rawData.reddit),
          subreddit: rawData.reddit.subreddit,
        },
        wykop: mapToSocialPost(rawData.wykop),
        discord: mapToSocialPost(rawData.discord),
        telegram: mapToSocialPost(rawData.telegram),
      };

      return finalOutput;
    }

    throw new Error("Model returned empty response");
  } catch (error) {
    console.error("Błąd podczas generowania treści przez Gemini:", error);
    throw error;
  }
}
