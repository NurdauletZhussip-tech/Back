ALTER TABLE "users"
ADD COLUMN "password_reset_token_hash" VARCHAR(255),
ADD COLUMN "password_reset_expires_at" TIMESTAMPTZ(6);

CREATE UNIQUE INDEX "users_password_reset_token_hash_key"
ON "users"("password_reset_token_hash");
