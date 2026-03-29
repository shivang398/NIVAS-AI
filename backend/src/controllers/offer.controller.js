import {
  createOfferService,
  getOffersService,
  updateOfferService,
} from "../services/offer.service.js";

import { emitOfferUpdate } from "../socket/events.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { success, created } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";


export const createOffer = asyncHandler(async (req, res) => {
  if (!req.body) {
    throw new AppError("Offer data is required", 400);
  }

  const data = await createOfferService(req.user, req.body);

  return created(res, data, "Offer created");
});


export const getOffers = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const data = await getOffersService(req.user, page, limit);

  return success(res, data, "Offers fetched");
});


export const updateOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Offer ID is required", 400);
  }

  const updatedOffer = await updateOfferService(id, req.body, req.user);

  emitOfferUpdate(updatedOffer);

  return success(res, updatedOffer, "Offer updated");
});