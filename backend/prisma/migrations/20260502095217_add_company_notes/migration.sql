-- AlterTable
ALTER TABLE "Application" ALTER COLUMN "companyId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "notes" TEXT;
