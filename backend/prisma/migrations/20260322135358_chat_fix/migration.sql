/*
  Warnings:

  - A unique constraint covering the columns `[propertyId,tenantId,ownerId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Lease" ADD COLUMN     "endDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Chat_tenantId_idx" ON "Chat"("tenantId");

-- CreateIndex
CREATE INDEX "Chat_ownerId_idx" ON "Chat"("ownerId");

-- CreateIndex
CREATE INDEX "Chat_propertyId_idx" ON "Chat"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_propertyId_tenantId_ownerId_key" ON "Chat"("propertyId", "tenantId", "ownerId");

-- CreateIndex
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");
