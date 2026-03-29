import express from "express";
import { analyze } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/chat", analyze);

export default router;