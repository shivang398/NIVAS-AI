

import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getChat,
  sendMessage,
  getChats,
} from "../controllers/chat.controller.js";

const router = express.Router();
router.get("/", protect, getChats);


router.get("/:offerId", protect, getChat);

router.post("/:offerId", protect, sendMessage);

export default router;