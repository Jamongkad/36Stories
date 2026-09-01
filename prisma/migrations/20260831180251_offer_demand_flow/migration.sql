-- CreateEnum
CREATE TYPE "OfferKind" AS ENUM ('PRODUCT', 'SERVICE');

-- CreateEnum
CREATE TYPE "OfferMode" AS ENUM ('LIVE', 'COMING_SOON', 'IDEA');

-- CreateEnum
CREATE TYPE "OfferDestinationType" AS ENUM ('STORE', 'AFFILIATE', 'BOOKING', 'OTHER');

-- CreateEnum
CREATE TYPE "OfferCtaType" AS ENUM ('OUTBOUND', 'WAITLIST', 'INTEREST');

-- CreateEnum
CREATE TYPE "OfferEventType" AS ENUM ('VIEW', 'OUTBOUND_CLICK', 'INTEREST');

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "offerId" TEXT;

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "kind" "OfferKind" NOT NULL,
    "mode" "OfferMode" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "priceLabel" TEXT,
    "launchAt" TIMESTAMP(3),
    "destinationUrl" TEXT,
    "destinationType" "OfferDestinationType",
    "ctaType" "OfferCtaType" NOT NULL,
    "ctaLabel" TEXT NOT NULL,
    "feedbackPrompt" TEXT,
    "isAffiliate" BOOLEAN NOT NULL DEFAULT false,
    "disclosureText" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferSignup" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "contactId" TEXT,
    "email" TEXT NOT NULL,
    "consentAt" TIMESTAMP(3),
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfferSignup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferEvent" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "type" "OfferEventType" NOT NULL,
    "sessionId" TEXT,
    "source" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfferEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPostReference" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPostReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Offer_siteId_isPublished_sortOrder_idx" ON "Offer"("siteId", "isPublished", "sortOrder");

-- CreateIndex
CREATE INDEX "Offer_siteId_mode_isPublished_idx" ON "Offer"("siteId", "mode", "isPublished");

-- CreateIndex
CREATE INDEX "OfferSignup_offerId_createdAt_idx" ON "OfferSignup"("offerId", "createdAt");

-- CreateIndex
CREATE INDEX "OfferSignup_contactId_idx" ON "OfferSignup"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "OfferSignup_offerId_email_key" ON "OfferSignup"("offerId", "email");

-- CreateIndex
CREATE INDEX "OfferEvent_offerId_type_createdAt_idx" ON "OfferEvent"("offerId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "OfferEvent_offerId_sessionId_idx" ON "OfferEvent"("offerId", "sessionId");

-- CreateIndex
CREATE INDEX "SocialPostReference_offerId_platform_idx" ON "SocialPostReference"("offerId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "SocialPostReference_offerId_url_key" ON "SocialPostReference"("offerId", "url");

-- CreateIndex
CREATE INDEX "Feedback_offerId_idx" ON "Feedback"("offerId");

-- CreateIndex
CREATE INDEX "Feedback_offerId_isPublished_createdAt_idx" ON "Feedback"("offerId", "isPublished", "createdAt");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferSignup" ADD CONSTRAINT "OfferSignup_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferSignup" ADD CONSTRAINT "OfferSignup_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferEvent" ADD CONSTRAINT "OfferEvent_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPostReference" ADD CONSTRAINT "SocialPostReference_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
