import { Schema, model } from "mongoose";
import {
  type IAllPromptConfig,
  type IRedditPromptConfig,
  type IAIConfig,
} from "../types/promptInterface";

const StandardPlatformConfigSchema = new Schema<IAllPromptConfig>(
  {
    titleDescription: { type: String, default: "" },
    contentDescription: { type: String, default: "" },
  },
  { _id: false },
);

const RedditPlatformConfigSchema = new Schema<IRedditPromptConfig>(
  {
    titleDescription: { type: String, default: "" },
    contentDescription: { type: String, default: "" },
    subredditDescription: { type: String, default: "" }, // Obecne TYLKO tutaj
  },
  { _id: false },
);

const AIConfigSchema = new Schema<IAIConfig>(
  {
    systemPrompt: {
      type: String,
      default:
        "Jesteś profesjonalnym Social Media Managerem. Przekształć poniższy artykuł z satkurier.pl w unikalne posty na platformy: X, Facebook, LinkedIn, Reddit, Wykop, Discord oraz Telegram. 🔥\nDodatkowo, przypisz do artykułu od 1 do 3 pasujących kategorii.\nNigdy nie dawaj pauz. Żadnych tagów html.",
    },
    allowedCategories: {
      type: [String],
      default: [
        "Streaming",
        "Sport w TV",
        "Polskie platformy",
        "Kanały TV",
        "Technologia",
        "Telekomunikacja",
        "Satelity",
        "Naziemna TV",
      ],
    },
    x: {
      type: StandardPlatformConfigSchema,
      default: {
        titleDescription: "Chwytliwy, bardzo krótki nagłówek posta na X",
        contentDescription:
          "Właściwy post na X, max 240 znaków (zostaw miejsce na link)",
      },
    },
    facebook: {
      type: StandardPlatformConfigSchema,
      default: {
        titleDescription: "Mocny nagłówek przyciągający uwagę na FB",
        contentDescription:
          "Dwa, trzy zdania na FB z emotkami, punktorami i hashtagami branżowymi. Zachowaj ton ekspercki, ale przystępny. Na końcu dodaj zachętę do dyskusji w komentarzach. Nie używaj linków w treści posta.",
      },
    },
    linkedin: {
      type: StandardPlatformConfigSchema,
      default: {
        titleDescription: "Profesjonalny, biznesowy tytuł posta na LinkedIn",
        contentDescription:
          "Ekspercka treść na LinkedIn z punktorami i hashtagami branżowymi",
      },
    },
    reddit: {
      type: RedditPlatformConfigSchema,
      default: {
        titleDescription:
          "Chwytliwy, dyskusyjny tytuł posta na Reddit, bez użycia emoji.",
        contentDescription:
          "Treść posta w formacie tekstowym na Reddit z podziałem na akapity, BEZ hashtagów.",
        subredditDescription:
          "Zaproponuj od 1 do 3 istniejących, pasujących subredditów (np. polska, telewizja, kkslech, ekstraklasa, streaming) w formie tablicy stringów, dopasowanych ściśle do tematyki artykułu.",
      },
    },
    wykop: {
      type: StandardPlatformConfigSchema,
      default: {
        titleDescription:
          "Chwytliwy tytuł znaleziska/wpisu na Wykop z zachowaniem technicznego charakteru.",
        contentDescription:
          "Krótka zajawka na mikroblog lub opis znaleziska. Możesz użyć maksymalnie 3-4 powiązanych hashtagów (np. #satkurier #telewizja).",
      },
    },
    discord: {
      type: StandardPlatformConfigSchema,
      default: {
        titleDescription:
          "Krótki, przyciągający uwagę nagłówek wiadomości z użyciem emoji (np. 📡, 📺).",
        contentDescription:
          "Zwięzła, czytelna treść wiadomości na kanał dyskusyjny z wyraźnym formatowaniem pogrubienia (**tekst**).",
      },
    },
    telegram: {
      type: StandardPlatformConfigSchema,
      default: {
        titleDescription:
          "Krótki, przyciągający uwagę nagłówek wiadomości z użyciem emoji (np. 📡, 📺).",
        contentDescription:
          "Zwięzła, czytelna treść wiadomości na kanał dyskusyjny z wyraźnym formatowaniem pogrubienia (**tekst**).",
      },
    },
  },
  { timestamps: true, collection: "prompts" },
);

export default model<IAIConfig>("AIConfig", AIConfigSchema);
