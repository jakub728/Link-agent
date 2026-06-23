export interface DataFromLink {
  title: string;
  description: string | null;
  link: string;
  imageUrl: string | null;
}

export interface ISocialPost {
  title: string;
  content: string;
  uploaded: boolean;
  additional_photo: string | null;
}

export interface IRedditPost extends ISocialPost {
  subreddit: string[];
}

export interface GeneratingInterface extends DataFromLink {
  categories: string[];
  x: ISocialPost;
  facebook: ISocialPost;
  linkedin: ISocialPost;
  reddit: IRedditPost;
  wykop: ISocialPost;
  discord: ISocialPost;
  telegram: ISocialPost;
}
