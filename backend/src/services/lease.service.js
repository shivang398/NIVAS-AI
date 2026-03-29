import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export const createLeaseIfEligible = async (verificationId) => {
  if (!verificationId) {
    throw new AppError("Verification ID is required", 400);
  }

  return prisma.$transaction(async (tx) => {
    const verification = await tx.verification.findUnique({
      where: { id: verificationId },
    });

    if (!verification || verification.status !== "APPROVED") {
      throw new AppError("Verification not approved", 400);
    }

    const offer = await tx.offer.findUnique({
      where: { id: verification.offerId },
      include: {
        property: true,
      },
    });

    if (!offer || offer.status !== "ACCEPTED") {
      throw new AppError("No valid accepted offer found", 400);
    }

    if (offer.property.status === "OCCUPIED") {
      throw new AppError("Property already occupied", 400);
    }

    const existingLease = await tx.lease.findFirst({
      where: {
        propertyId: offer.propertyId,
        status: "ACTIVE",
      },
    });

    if (existingLease) {
      throw new AppError("Active lease already exists", 400);
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + 1);

    const lease = await tx.lease.create({
      data: {
        tenantId: verification.tenantId,
        ownerId: offer.property.ownerId,
        propertyId: offer.propertyId,
        rent: offer.price,
        duration: 12,
        startDate,
        endDate,
        status: "ACTIVE",
      },
    });

    await tx.property.update({
      where: { id: offer.propertyId },
      data: { status: "OCCUPIED" },
    });

    await tx.notification.createMany({
      data: [
        {
          userId: verification.tenantId,
          title: "Lease Created",
          message: "Your lease has been successfully created. Welcome home!",
        },
        {
          userId: offer.property.ownerId,
          title: "Lease Created",
          message: "A highly-verified lease has been signed for your property.",
        },
      ],
    });

    await tx.verification.update({
      where: { id: verificationId },
      data: { leaseCreated: true },
    });

    return lease;
  });
};