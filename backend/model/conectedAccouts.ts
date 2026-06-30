import { Schema, model } from "mongoose";
import { type ConnectedAccoutInterface } from "../types/conectedInterface";

const ConnectedAccoutSchema = new Schema<ConnectedAccoutInterface>({
  userId: { type: Schema.Types.ObjectId },
  platform: { type: String, required: true },
  profileId: { type: String },
  profileName: { type: String, required: true },
  picture: { type: String },
  credentials: {
    accessToken: { type: String },
    refreshToken: { type: String },
    expiresAt: { type: Date },
    botToken: { type: String },
    chatId: { type: String },
  },
  createdAt: { type: Date },
});

const Account = model<ConnectedAccoutInterface>(
  "Account",
  ConnectedAccoutSchema,
);

export default Account;
