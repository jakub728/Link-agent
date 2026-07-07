import { Schema, model } from "mongoose";
import { type GeneratingInterface } from "../types/generatedInterface";

const UploadedAccountSchema = new Schema(
  {
    id: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    uploaded: { type: Boolean, default: false },
  },
  {
    _id: false,
  },
);

const SocialPostSchema = new Schema(
  {
    title: { type: String, default: "" },
    content: { type: String, required: true },
    uploaded: [UploadedAccountSchema],
    additional_photo: { type: String, default: null },
  },
  { _id: false },
);

const RedditPostSchema = new Schema(
  {
    title: { type: String, default: "" },
    content: { type: String, required: true },
    uploaded: [UploadedAccountSchema],
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
  },
);

const Draft = model<GeneratingInterface>("GeneratedData", GeneratingSchema);

export default Draft;
