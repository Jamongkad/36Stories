-- Better Auth identity and session storage.
ALTER TABLE "User"
  ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "image" TEXT,
  ADD COLUMN "username" TEXT,
  ADD COLUMN "displayUsername" TEXT;

-- Existing installs predate usernames. Preserve them with a deterministic, normalized value.
UPDATE "User"
SET "username" = lower(regexp_replace(split_part("email", '@', 1), '[^a-z0-9_]', '', 'g')) || '_' || substr("id", 1, 6)
WHERE "username" IS NULL;

ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

CREATE TABLE "Account" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "issuer" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP(3),
  "refreshTokenExpiresAt" TIMESTAMP(3),
  "scope" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Account_issuer_accountId_key" ON "Account"("issuer", "accountId");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Verification" (
  "id" TEXT NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");

CREATE TABLE "RateLimit" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL,
  "lastRequest" BIGINT NOT NULL,
  CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RateLimit_key_key" ON "RateLimit"("key");

-- The old check-then-insert event path could race. Keep the earliest event from
-- each existing duplicate group before enforcing database-level idempotency.
DELETE FROM "OfferEvent" AS duplicate
USING "OfferEvent" AS keeper
WHERE duplicate."sessionId" IS NOT NULL
  AND duplicate."offerId" = keeper."offerId"
  AND duplicate."type" = keeper."type"
  AND duplicate."sessionId" = keeper."sessionId"
  AND (
    duplicate."createdAt" > keeper."createdAt"
    OR (
      duplicate."createdAt" = keeper."createdAt"
      AND duplicate."id" > keeper."id"
    )
  );

CREATE UNIQUE INDEX "OfferEvent_offerId_type_sessionId_key" ON "OfferEvent"("offerId", "type", "sessionId");
