import crypto from "crypto";
import path from "path";
import Tesseract from "tesseract.js";
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
    include: { documents: true, tenant: true },
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

  // Only penalize missing core documents if they've uploaded at least something else
  // to avoid instant "Fraud" on the the first initial upload step.
  if (verification.documents.length >= 2) {
    if (!hasAadhar) {
      score += 35;
      reasons.push("Aadhaar Card not uploaded");
    }

    if (!hasPAN) {
      score += 35;
      reasons.push("PAN Card not uploaded");
    }
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
    score += 15;
    reasons.push("Insufficient documents uploaded (need at least Aadhaar + PAN)");
  }

  // ─── CHECK 6: OCR AI Data Extraction & Regex Matching ───────
  for (const doc of verification.documents) {
    const isImage = [".png", ".jpg", ".jpeg"].some(ext => doc.fileUrl.toLowerCase().endsWith(ext));
    if (isImage) {
      try {
        const filePath = path.join(process.cwd(), doc.fileUrl);
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
        const extractedText = text.toUpperCase();

        // Regex validations based on document type
        // Regex validations based on document type
        if (doc.fileType === "AADHAR_CARD") {
          const aadharRegex = /(?:\d{4}\s?\d{4}\s?\d{4})|(?:\d{12})/;
          const hasAadharWord = /AADHAAR|GOVERNMENT OF INDIA|UIDAI/.test(extractedText);
          if (!aadharRegex.test(extractedText) && !hasAadharWord) {
            score += 15;
            reasons.push("AI OCR: Invalid or missing Aadhar numbering/keywords in document.");
          }
        } 
        else if (doc.fileType === "PAN_CARD") {
          const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
          const hasPanWord = /INCOME TAX DEPART|INCOME TAX|PAN/.test(extractedText);
          if (!panRegex.test(extractedText) && !hasPanWord) {
            score += 15;
            reasons.push("AI OCR: Invalid or missing PAN numbering/keywords in document.");
          }
        }

        // Identity verification: Map user info
        const userName = verification.tenant?.name?.toUpperCase() || "";
        // Check if at least parts of the user's name appear in the document
        const nameParts = userName.split(" ").filter(n => n.length > 2);
        let nameMatched = false;
        for (const part of nameParts) {
            if (extractedText.includes(part)) {
                nameMatched = true;
                break;
            }
        }

        if (!nameMatched && userName && nameParts.length > 0) {
            // Check if perhaps an ID number was present, we don't penalize too much if name isn't perfectly read
            score += 10;
            reasons.push(`AI OCR: Minor Name mismatch for "${userName}" in document ${doc.fileType}.`);
        }

      } catch (err) {
        console.error("OCR Extraction failed for", doc.fileUrl, err.message);
        // Do not severely arbitrarily penalize if OCR dependency fails, but log it
        reasons.push(`AI OCR: Failed to process text for ${doc.fileType}`);
      }
    }
  }

  // Cap score at 100
  score = Math.min(score, 100);

  // ─── Determine status ───────────────────────────────────────
  let status = "SAFE";
  if (score >= 80) status = "FRAUD";
  else if (score >= 45) status = "SUSPICIOUS";

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