import crypto from "crypto";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export const runFraudCheck = async (verificationId, fileUrl) => {
  if (!verificationId || !fileUrl) {
    throw new AppError("Verification ID and file URL are required", 400);
  }

  const existingCheck = await prisma.fraudCheck.findUnique({
    where: { verificationId },
  });

  if (existingCheck) {
    return existingCheck;
  }

  let score = 0;
  const reasons = [];

  const allowedTypes = [".png", ".jpg", ".jpeg", ".pdf"];

  const isValidType = allowedTypes.some((ext) =>
    fileUrl.toLowerCase().endsWith(ext)
  );

  if (!isValidType) {
    score += 30;
    reasons.push("Invalid file type");
  }

  const hash = crypto
    .createHash("sha256")
    .update(`${fileUrl}-${verificationId}`)
    .digest("hex");

  const duplicate = await prisma.fraudCheck.findFirst({
    where: { remarks: hash },
  });

  if (duplicate) {
    score += 40;
    reasons.push("Duplicate document detected");
  }


  if (fileUrl.toLowerCase().includes("fake")) {
    score += 30;
    reasons.push("Suspicious filename pattern");
  }


  let status = "SAFE";

  if (score >= 70) status = "FRAUD";
  else if (score >= 30) status = "SUSPICIOUS";


  const result = await prisma.fraudCheck.create({
    data: {
      verificationId,
      score,
      status,
      remarks: hash,
    },
  });


  console.log("Fraud Check:", {
    verificationId,
    score,
    status,
    reasons,
  });

  return result;
};