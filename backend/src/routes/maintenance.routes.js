import express from "express";
import {
  createMaintenance,
  getMaintenance,
  updateMaintenance,
} from "../controllers/maintenance.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();


router.post("/", protect, createMaintenance);

router.get("/", protect, getMaintenance);


router.patch("/:id", protect, updateMaintenance);

export default router;