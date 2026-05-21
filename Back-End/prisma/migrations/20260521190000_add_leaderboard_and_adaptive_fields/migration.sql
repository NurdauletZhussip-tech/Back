ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "date_of_birth" DATE;

ALTER TABLE "exercises"
ADD COLUMN IF NOT EXISTS "difficulty" INTEGER DEFAULT 1;

CREATE INDEX IF NOT EXISTS "idx_users_role_dob" ON "users"("role", "date_of_birth");
CREATE INDEX IF NOT EXISTS "idx_exercises_lesson_difficulty" ON "exercises"("lesson_id", "difficulty");
