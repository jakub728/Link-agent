export interface ScrapedLinkData {
  title: string;
  link: string;
  imageUrl: string | null;
  description: string | null;
}

export interface GeneratedPostAll {
  title: string;
  content: string;
  uploaded: boolean;
  additional_photo: string | null;
}
export interface GeneratedPostReddit {
  title: string;
  content: string;
  subreddit: string;
  uploaded: boolean;
  additional_photo: string | null;
}

export interface GeneratedPost {
  _id: string;
  title: string;
  description?: string;
  link?: string;
  imageUrl?: string | null;
  categories: string[];
  author: string;
  x: GeneratedPostAll;
  facebook: GeneratedPostAll;
  linkedin: GeneratedPostAll;
  reddit: GeneratedPostReddit;
  wykop: GeneratedPostAll;
  discord: GeneratedPostAll;
  telegram: GeneratedPostAll;
  createdAt: string;
}

export type PlatformType =
  | "facebook"
  | "x"
  | "linkedin"
  | "reddit"
  | "wykop"
  | "discord"
  | "telegram";
