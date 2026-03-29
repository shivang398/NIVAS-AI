import prisma from "../config/prisma.js";
import { getIO } from "../socket/socket.js";
import { AppError } from "../utils/AppError.js";


export const getOffersService = async (user, page = 1, limit = 20) => {
  if (!user?.id) {
    throw new AppError("User not authenticated", 401);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  if (user.role === "TENANT") {
    return prisma.offer.findMany({
      where: { tenantId: user.id },
      skip,
      take,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            price: true,
            imageUrls: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (user.role === "OWNER") {
    return prisma.offer.findMany({
      where: {
        property: { ownerId: user.id },
      },
      skip,
      take,
      include: {
        property: true,
        tenant: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return [];
};

export const createOfferService = async (user, body) => {
  const { propertyId, price } = body;

  if (!propertyId || !price) {
    throw new AppError("Property and price are required", 400);
  }


  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }


  if (property.ownerId === user.id) {
    throw new AppError("Owner cannot create offer", 400);
  }


  const existing = await prisma.offer.findFirst({
    where: {
      propertyId,
      tenantId: user.id,
    },
  });

  if (existing) {
    throw new AppError("Offer already exists for this property", 400);
  }


  const offer = await prisma.offer.create({
    data: {
      propertyId,
      tenantId: user.id,
      price: Number(price),
      status: "PENDING",
    },
  });


  await prisma.chat.upsert({
    where: { offerId: offer.id },
    update: {},
    create: { offerId: offer.id },
  });

  return offer;
};


export const updateOfferService = async (id, body, user) => {
  if (!id) {
    throw new AppError("Offer ID is required", 400);
  }

  const { status, price } = body;


  const offer = await prisma.offer.findUnique({
    where: { id },
    include: {
      property: true,
    },
  });

  if (!offer) {
    throw new AppError("Offer not found", 404);
  }


  const isOwner = offer.property.ownerId === user.id;
  const isTenant = offer.tenantId === user.id;

  if (!isOwner && !isTenant) {
    throw new AppError("Unauthorized", 403);
  }

  if (isTenant && status) {
    throw new AppError("Tenants cannot accept or reject their own offers", 403);
  }


  const updatedOffer = await prisma.offer.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(price !== undefined && { price: Number(price) }),
    },
    include: {
      property: true,
      tenant: {
        select: { id: true, name: true },
      },
    },
  });


  const io = getIO();
  io.to(id).emit("offer_updated", updatedOffer);


  if (status === "ACCEPTED") {

    console.log("Offer accepted → ready for lease flow");
  }

  return updatedOffer;
};