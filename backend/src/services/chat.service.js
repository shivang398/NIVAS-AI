import prisma from "../config/prisma.js";
import { getIO } from "../socket/socket.js";
import { AppError } from "../utils/AppError.js";


export const getChatByOfferService = async (offerId, userId) => {
  if (!offerId) {
    throw new AppError("Offer ID is required", 400);
  }


  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      property: true,
      tenant: {
        select: { id: true, name: true },
      },
    },
  });

  if (!offer) {
    throw new AppError("Offer not found", 404);
  }


  const isTenant = offer.tenantId === userId;
  const isOwner = offer.property.ownerId === userId;

  if (!isTenant && !isOwner) {
    throw new AppError("Unauthorized", 403);
  }


  const chat = await prisma.chat.upsert({
    where: { offerId },
    update: {},
    create: { offerId },
    include: {
      offer: {
        include: {
          property: true,
          tenant: {
            select: { id: true, name: true },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  return chat;
};


export const sendMessageService = async (body, senderId) => {
  const { offerId, text } = body;

  if (!offerId || !text) {
    throw new AppError("offerId and text are required", 400);
  }


  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { property: true },
  });

  if (!offer) {
    throw new AppError("Offer not found", 404);
  }


  if (
    offer.tenantId !== senderId &&
    offer.property?.ownerId !== senderId
  ) {
    throw new AppError("Unauthorized", 403);
  }

  const chat = await prisma.chat.upsert({
    where: { offerId },
    update: {},
    create: { offerId },
  });


  const message = await prisma.message.create({
    data: {
      chatId: chat.id,
      senderId,
      text,
    },
    include: {
      sender: {
        select: { id: true, name: true },
      },
    },
  });


  const io = getIO();
  io.to(offerId).emit("receive_message", message);

  return message;
};


export const getChatsService = async (userId) => {
  if (!userId) {
    throw new AppError("User ID required", 400);
  }

  return prisma.chat.findMany({
    where: {
      offer: {
        OR: [
          { tenantId: userId },
          { property: { ownerId: userId } },
        ],
      },
    },
    include: {
      offer: {
        include: {
          property: true,
          tenant: {
            select: { id: true, name: true },
          },
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};