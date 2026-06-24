import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import axios from "axios";
import { type AuthenticatedRequest } from "../types/userInterface";
import { checkToken } from "../middleware/checkToken";
import GeneratedData from "../model/generated";

const router = express.Router();

export default router;
