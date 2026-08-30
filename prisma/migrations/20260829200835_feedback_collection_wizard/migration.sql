-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('INSTAGRAM', 'TIKTOK');

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "socialHandle" TEXT,
ADD COLUMN     "socialPlatform" "SocialPlatform",
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;
