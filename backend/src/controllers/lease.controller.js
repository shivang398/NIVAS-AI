

import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

const prisma = new PrismaClient();

export const getLeases = asyncHandler(async (req, res) => {
  const leases = await prisma.lease.findMany({
    where: {
      OR: [
        { tenantId: req.user.id },
        { ownerId: req.user.id },
      ],
    },
    include: {
      property: true,
      tenant: { select: { name: true, email: true } },
      owner: { select: { name: true, email: true } },
    },
  });

  return success(res, leases, "Leases fetched");
});