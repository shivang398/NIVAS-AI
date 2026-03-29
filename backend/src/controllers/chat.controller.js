import {
  getChatByOfferService,
  sendMessageService,
  getChatsService,
} from "../services/chat.service.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";


export const getChat = asyncHandler(async (req, res) => {
  const { offerId } = req.params;

  if (!offerId) {
    throw new AppError("Offer ID is required", 400);
  }

  const data = await getChatByOfferService(
    offerId,
    req.user.id
  );

  return success(res, data, "Chat fetched");
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { offerId } = req.params;
  const { text } = req.body;

  if (!offerId || !text) {
    throw new AppError("Offer ID and message text are required", 400);
  }

  const data = await sendMessageService(
    { offerId, text },
    req.user.id
  );

  return success(res, data, "Message sent");
});


export const getChats = asyncHandler(async (req, res) => {
  const data = await getChatsService(req.user.id);

  return success(res, data, "Chats fetched");
});