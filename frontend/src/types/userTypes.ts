export interface UserPrompts {
  _id: string;
  systemPrompt?: string;
  facebook?: string;
  linkedin?: string;
  x?: string;
  reddit?: string;
  discord?: string;
  wykop?: string;
  telegram?: string;
}

export interface UserData {
  id: string;
  login: string;
  role: string;
  prompts: UserPrompts;
}

