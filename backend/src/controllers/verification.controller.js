import {
  createVerificationService,
  uploadDocumentService,
  reviewVerificationService,
  getVerificationService,
} from "../services/verification.service.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { success, created } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";


export const createVerification = asyncHandler(async (req, res) => {
  const { offerId } = req.body;
  
  if (!offerId) {
    throw new AppError("Offer ID is required to initialize verification.", 400);
  }

  const data = await createVerificationService(req.user, offerId);

  return created(res, data, "Verification legally bound and created");
});


export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Document file is required", 400);
  }

  const data = await uploadDocumentService(req.body, req.file);

  return success(res, data, "Document uploaded");
});

export const reviewVerification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Verification ID is required", 400);
  }

  const data = await reviewVerificationService(
    id,
    req.body,
    req.user
  );

  return success(res, data, "Verification updated");
});

export const getVerifications = asyncHandler(async (req, res) => {
  const data = await getVerificationService(req.user);

  return success(res, data, "Verifications fetched");
});