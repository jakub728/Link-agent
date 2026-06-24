export interface ScrapedLinkData {
  title: string;
  link: string;
  imageUrl: string | null;
  description: string | null;
}

export interface GeneratedPost {
  _id: string;
  title: string;
  description?: string;
  link?: string;
  imageUrl?: string | null;
  categories: string[];
  author: string;
  x: any; // Możesz zastąpić swoim IAllPromptConfig
  facebook: any;
  linkedin: any;
  reddit: any;
  wykop: any;
  discord: any;
  telegram: any;
  createdAt: string;
}
