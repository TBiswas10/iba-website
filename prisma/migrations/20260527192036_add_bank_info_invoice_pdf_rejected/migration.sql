-- AlterEnum
ALTER TYPE "MembershipStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "bankAccountName" TEXT,
ADD COLUMN "bankBsb" TEXT,
ADD COLUMN "bankAccountNumber" TEXT;

-- AlterTable
ALTER TABLE "ReimbursementInvoice" ADD COLUMN "invoicePdfUrl" TEXT;
