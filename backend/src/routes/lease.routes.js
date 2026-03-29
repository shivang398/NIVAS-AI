
import express from "express";
import { getLeases } from "../controllers/lease.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();


router.get("/", protect, getLeases);

export default router;