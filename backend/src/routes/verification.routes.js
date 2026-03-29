import express from "express";
import {
  createVerification,
  uploadDocument,
  reviewVerification,
  getVerifications,
} from "../controllers/verification.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();


router.post(
  "/",
  protect,
  allowRoles("TENANT"),
  createVerification
);


router.post(
  "/upload",
  protect,
  allowRoles("TENANT"),
  upload.single("file"),
  uploadDocument
);

router.patch(
  "/:id",
  protect,
  allowRoles("POLICE"),
  reviewVerification
);


router.get("/", protect, getVerifications);

export default router;