import { Schema, model } from "mongoose";
import { type GeneratingInterface } from "../types/generatedInterface";

const UploadedAccountSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    accountName: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    _id: false,
  },
);

const SocialPostSchema = new Schema(
  {
    title: { type: String, default: "" },
    content: { type: String, required: true },
    uploaded: { type: [UploadedAccountSchema], default: [] },
    additional_photo: { type: String, default: null },
  },
  { _id: false },
);

const RedditPostSchema = new Schema(
  {
    title: { type: String, default: "" },
    content: { type: String, required: true },
    uploaded: { type: [UploadedAccountSchema], default: [] },
    subreddit: [{ type: String }],
    additional_photo: { type: String, default: null },
  },
  { _id: false },
);

const GeneratingSchema = new Schema<GeneratingInterface>(
  {
    title: { type: String, required: true },
    description: { type: String, default: null },
    imageUrl: { type: String, default: null },
    link: { type: String, required: true, unique: true },
    categories: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },

    x: { type: SocialPostSchema, required: true },
    facebook: { type: SocialPostSchema, required: true },
    linkedin: { type: SocialPostSchema, required: true },
    reddit: { type: RedditPostSchema, required: true },
    wykop: { type: SocialPostSchema, required: true },
    discord: { type: SocialPostSchema, required: true },
    telegram: { type: SocialPostSchema, required: true },
  },
  {
    collection: "generated_data",
    timestamps: true,
  },
);

const Draft = model<GeneratingInterface>("GeneratedData", GeneratingSchema);

export default Draft;
