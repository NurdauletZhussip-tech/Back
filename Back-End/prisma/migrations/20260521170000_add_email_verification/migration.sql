ALTER TABLE "users"
ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "email_verification_token_hash" VARCHAR(255),
ADD COLUMN "email_verification_expires_at" TIMESTAMPTZ(6);

UPDATE "users"
SET "email_verified" = true
WHERE "email" IS NOT NULL
  AND "role" IN ('parent', 'admin');

CREATE UNIQUE INDEX "users_email_verification_token_hash_key"
ON "users"("email_verification_token_hash");
