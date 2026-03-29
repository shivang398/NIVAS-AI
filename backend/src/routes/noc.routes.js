import express from "express";
import {
  getSystemStatus,
  getAlerts,
} from "../controllers/noc.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/status", protect, getSystemStatus);


router.get("/alerts", protect, getAlerts);

export default router;