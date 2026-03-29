/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FraudCheck` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MaintenanceRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NOCRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Offer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Verification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_verificationId_fkey";

-- DropForeignKey
ALTER TABLE "FraudCheck" DROP CONSTRAINT "FraudCheck_verificationId_fkey";

-- DropForeignKey
ALTER TABLE "MaintenanceRequest" DROP CONSTRAINT "MaintenanceRequest_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "MaintenanceRequest" DROP CONSTRAINT "MaintenanceRequest_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "NOCRecord" DROP CONSTRAINT "NOCRecord_issuedBy_fkey";

-- DropForeignKey
ALTER TABLE "NOCRecord" DROP CONSTRAINT "NOCRecord_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "NOCRecord" DROP CONSTRAINT "NOCRecord_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Verification" DROP CONSTRAINT "Verification_tenantId_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "isRead";

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "deposit" DOUBLE PRECISION,
ADD COLUMN     "image" TEXT;

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "FraudCheck";

-- DropTable
DROP TABLE "MaintenanceRequest";

-- DropTable
DROP TABLE "NOCRecord";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "Offer";

-- DropTable
DROP TABLE "Verification";

-- DropEnum
DROP TYPE "FraudStatus";

-- DropEnum
DROP TYPE "MaintenanceStatus";
