import { Types } from "mongoose";
import { Request } from "express";

export interface IUser {
  login: string;
  password: string;
  role: string;
  prompts: Types.ObjectId;
  createdAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    login: string;
    role: string;
  };
  userConfig?: any;
}
