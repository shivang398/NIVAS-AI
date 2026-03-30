import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export const createMaintenanceService = async (user, body) => {
  const { propertyId, issue, priority } = body;

  if (!propertyId || !issue) {
    throw new AppError("Property and issue are required", 400);
  }

  const lease = await prisma.lease.findFirst({
    where: {
      tenantId: user.id,
      propertyId,
      status: { equals: "active", mode: "insensitive" },
    },
  });

  if (!lease) {
    throw new AppError("No active lease found for this property. You need an active lease to submit maintenance requests.", 400);
  }


  const validPriorities = ["low", "medium", "high"];
  const finalPriority = validPriorities.includes(priority)
    ? priority
    : "medium";


  return prisma.maintenance.create({
    data: {
      propertyId,
      tenantId: user.id,
      ownerId: lease.ownerId,
      issue,
      priority: finalPriority,
      status: "open",
    },
  });
};


export const getMaintenanceService = async (user) => {
  if (!user?.id) {
    throw new AppError("User not authenticated", 401);
  }

  if (user.role === "TENANT") {
    return prisma.maintenance.findMany({
      where: { tenantId: user.id },
      orderBy: { createdAt: "desc" },
    });
  }

  if (user.role === "OWNER") {
    return prisma.maintenance.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
    });
  }

  return [];
};


export const updateMaintenanceService = async (user, id, body) => {
  const { status } = body;

  if (!id) {
    throw new AppError("Maintenance ID is required", 400);
  }

  const validStatus = ["open", "in_progress", "resolved"];

  if (!validStatus.includes(status)) {
    throw new AppError("Invalid status", 400);
  }

  const request = await prisma.maintenance.findUnique({
    where: { id },
  });

  if (!request) {
    throw new AppError("Request not found", 404);
  }


  if (request.ownerId !== user.id) {
    throw new AppError("Unauthorized", 403);
  }


  return prisma.maintenance.update({
    where: { id },
    data: { status },
  });
};