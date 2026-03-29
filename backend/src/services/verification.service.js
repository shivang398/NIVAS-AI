import prisma from "../config/prisma.js";
import { runFraudCheck } from "./fraud.service.js";
import { notifyUsersByRole, createNotification } from "./notification.service.js";
import { createLeaseIfEligible } from "./lease.service.js";
import { AppError } from "../utils/AppError.js";


export const createVerificationService = async (user, offerId) => {
  if (!user?.id) {
    throw new AppError("User not authenticated", 401);
  }

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
  });

  if (!offer || offer.tenantId !== user.id || offer.status !== 'ACCEPTED') {
    throw new AppError("Valid accepted offer required to begin verification", 400);
  }

  const existing = await prisma.verification.findFirst({
    where: { offerId },
  });

  if (existing) {
    throw new AppError("Verification sequence already exists for this offer", 400);
  }

  return prisma.verification.create({
    data: {
      tenantId: user.id,
      offerId,
      status: "PENDING",
    },
  });
};


export const uploadDocumentService = async (body, file) => {
  const { verificationId, fileType } = body;

  if (!verificationId || !file || !fileType) {
    throw new AppError("Missing required fields", 400);
  }


  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: { documents: true },
  });

  if (!verification) {
    throw new AppError("Verification not found", 404);
  }


  const fileUrl = file.path;


  const alreadyExists = verification.documents.find(
    (doc) => doc.fileUrl === fileUrl
  );

  if (alreadyExists) {
    throw new AppError("Document already uploaded", 400);
  }

  const doc = await prisma.document.create({
    data: {
      verificationId,
      fileUrl,
      fileType,
    },
  });

  if (verification.documents.length + 1 >= 2) {
    await prisma.verification.update({
      where: { id: verificationId },
      data: { status: "UNDER_REVIEW" },
    });
  }

////
  const existingFraud = await prisma.fraudCheck.findUnique({
    where: { verificationId },
  });

  if (!existingFraud) {
    await runFraudCheck(verificationId, fileUrl);
  }


  await notifyUsersByRole(
    "POLICE",
    "New Verification Request",
    "Tenant uploaded documents"
  );

  return doc;
};


export const reviewVerificationService = async (id, body, user) => {
  const { status } = body;

  const valid = ["APPROVED", "REJECTED"];

  if (!valid.includes(status)) {
    throw new AppError("Invalid status", 400);
  }

  if (user?.role !== "POLICE") {
    throw new AppError("Unauthorized", 403);
  }


  const verification = await prisma.verification.findUnique({
    where: { id },
  });

  if (!verification) {
    throw new AppError("Verification not found", 404);
  }


  const updated = await prisma.verification.update({
    where: { id },
    data: { status },
  });


  await createNotification(
    updated.tenantId,
    `Verification ${status}`,
    `Your verification was ${status}`
  );


  if (status === "APPROVED") {
    await createLeaseIfEligible(id);
  }

  return updated;
};


export const getVerificationService = async (user) => {
  if (!user?.id) {
    throw new AppError("User not authenticated", 401);
  }

  if (user.role === "TENANT") {
    return prisma.verification.findMany({
      where: { tenantId: user.id },
      include: {
        documents: true,
        fraudCheck: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (user.role === "POLICE") {
    return prisma.verification.findMany({
      where: { status: "UNDER_REVIEW" },
      include: {
        documents: true,
        fraudCheck: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return [];
};