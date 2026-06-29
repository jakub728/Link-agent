import { Types } from "mongoose";

export interface ConnectedAccoutInterface {
  userId: Types.ObjectId | string;
  platform: string;
  profileId: string;
  profileName: string;
  credentials: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    botToken?: string;
    chatId?: string;
  };
  createdAt: Date;
}
