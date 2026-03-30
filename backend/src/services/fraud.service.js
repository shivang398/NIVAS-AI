import crypto from "crypto";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export const runFraudCheck = async (verificationId, fileUrl) => {
  if (!verificationId || !fileUrl) {
    throw new AppError("Verification ID and file URL are required", 400);
  }

  // Note: verification service now deletes old checks before calling this
  // to ensure we always calculate a fresh score across all documents.

  // Fetch verification with all uploaded documents
  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: { documents: true },
  });

  if (!verification) {
    throw new AppError("Verification not found", 404);
  }

  let score = 0;
  const reasons = [];

  // ─── CHECK 1: Required document types ───────────────────────
  const uploadedTypes = verification.documents.map(d => d.fileType);
  const hasAadhar = uploadedTypes.includes("AADHAR_CARD");
  const hasPAN = uploadedTypes.includes("PAN_CARD");

  if (!hasAadhar) {
    score += 35;
    reasons.push("Aadhaar Card not uploaded");
  }

  if (!hasPAN) {
    score += 35;
    reasons.push("PAN Card not uploaded");
  }

  // ─── CHECK 2: File format validation ────────────────────────
  const allowedTypes = [".png", ".jpg", ".jpeg", ".pdf"];

  for (const doc of verification.documents) {
    const isValidType = allowedTypes.some((ext) =>
      doc.fileUrl.toLowerCase().endsWith(ext)
    );
    if (!isValidType) {
      score += 15;
      reasons.push(`Invalid file type for ${doc.fileType}`);
    }
  }

  // ─── CHECK 3: Duplicate document detection ──────────────────
  const hash = crypto
    .createHash("sha256")
    .update(`${fileUrl}-${verificationId}`)
    .digest("hex");

  const duplicate = await prisma.fraudCheck.findFirst({
    where: { remarks: { contains: hash } },
  });

  if (duplicate) {
    score += 20;
    reasons.push("Duplicate document hash detected");
  }

  // ─── CHECK 4: Suspicious filename patterns ──────────────────
  const suspiciousPatterns = ["fake", "test", "sample", "dummy", "temp"];
  for (const doc of verification.documents) {
    const fileName = doc.fileUrl.toLowerCase();
    for (const pattern of suspiciousPatterns) {
      if (fileName.includes(pattern)) {
        score += 15;
        reasons.push(`Suspicious filename pattern: "${pattern}" in ${doc.fileType}`);
        break;
      }
    }
  }

  // ─── CHECK 5: Minimum document count ────────────────────────
  if (verification.documents.length < 2) {
    score += 20;
    reasons.push("Insufficient documents uploaded (need at least Aadhaar + PAN)");
  }

  // Cap score at 100
  score = Math.min(score, 100);

  // ─── Determine status ───────────────────────────────────────
  let status = "SAFE";
  if (score >= 70) status = "FRAUD";
  else if (score >= 30) status = "SUSPICIOUS";

  const remarksData = JSON.stringify({ hash, reasons });

  const result = await prisma.fraudCheck.create({
    data: {
      verificationId,
      score,
      status,
      remarks: remarksData,
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