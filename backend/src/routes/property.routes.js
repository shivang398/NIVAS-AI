import express from "express";
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from "../controllers/property.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { uploadMultiple } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { propertySchema } from "../validators/property.validator.js";

const router = express.Router();


router.post(
  "/",
  protect,
  uploadMultiple,
  validate(propertySchema),
  createProperty
);


router.get("/", getProperties);
router.get("/:id", getPropertyById);


router.patch(
  "/:id",
  protect,
  uploadMultiple,
  validate(propertySchema.partial()),
  updateProperty
);


router.delete("/:id", protect, deleteProperty);

export default router;