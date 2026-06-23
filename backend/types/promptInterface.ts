export interface IAllPromptConfig {
  titleDescription: string;
  contentDescription: string;
  subredditDescription?: string; 
}
export interface IRedditPromptConfig {
  titleDescription: string;
  contentDescription: string;
  subredditDescription?: string; 
}

export interface IAIConfig {
  systemPrompt: string;
  allowedCategories: string[];
  x: IAllPromptConfig;
  facebook: IAllPromptConfig;
  linkedin: IAllPromptConfig;
  reddit: IRedditPromptConfig;
  wykop: IAllPromptConfig;
  discord: IAllPromptConfig;
  telegram: IAllPromptConfig;
  createdAt?: Date;
  updatedAt?: Date;
}