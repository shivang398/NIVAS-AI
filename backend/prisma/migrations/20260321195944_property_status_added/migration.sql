-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('available', 'occupied');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "status" "PropertyStatus" NOT NULL DEFAULT 'available',
ALTER COLUMN "description" DROP NOT NULL;
