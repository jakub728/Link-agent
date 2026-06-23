import { Schema, model } from "mongoose";
import { type IUser } from "../types/userInterface";

const userSchema = new Schema<IUser>({
  login: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
  },
  prompts: {
    type: Schema.Types.ObjectId,
    ref: "AIConfig",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const User = model<IUser>("User", userSchema);
export default User;
