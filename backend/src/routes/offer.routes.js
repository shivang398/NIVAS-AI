import express from "express";
import {
  createOffer,
  getOffers,
  updateOffer,
} from "../controllers/offer.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();


router.get("/", protect, getOffers);


router.post("/", protect, allowRoles("TENANT"), createOffer);


router.patch("/:id", protect, updateOffer);

export default router;