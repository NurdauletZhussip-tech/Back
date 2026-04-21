CREATE TYPE user_role AS ENUM ('parent', 'child');
CREATE TYPE exercise_type AS ENUM ('phonics', 'handwriting', 'sight_words', 'vocabulary');
CREATE TYPE badge_criteria_type AS ENUM ('lessons_completed', 'total_xp', 'streak_days');
CREATE TYPE notification_type AS ENUM ('badge', 'streak', 'lesson_complete');