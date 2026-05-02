const LessonModel = require('../models/lessonModel');
const ExerciseModel = require('../models/exerciseModel');
const ProgressModel = require('../models/progressModel');
const AttemptModel = require('../models/attemptModel');
const GamificationService = require('./gamificationService');
const prisma = require('../prismaClient');

class LessonService {
  static async getAllLessonsPaginated(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      LessonModel.findPublished(skip, limit),
      LessonModel.countPublished()
    ]);

    return {
      data,
      meta: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        itemsPerPage: limit
      }
    };
  }

  static async getExercisesPaginated(lessonId, query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [exercises, total] = await Promise.all([
      ExerciseModel.findByLessonIdPaginated(lessonId, skip, limit),
      ExerciseModel.countByLessonId(lessonId)
    ]);

    return {
      data: exercises,
      meta: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        itemsPerPage: limit
      }
    };
  }

  static async submitExercise(childId, exerciseId, answer) {
    return await prisma.$transaction(async (tx) => {
      // Используем prisma transaction для атомарности операции
      const exercise = await tx.exercises.findUnique({
        where: { id: exerciseId }
      });

      if (!exercise) throw new Error('EXERCISE_NOT_FOUND');

      const previousCorrectAttempt = await tx.exercise_attempts.findFirst({
        where: {
          child_id: childId,
          exercise_id: exerciseId,
          correct: true
        }
      });

      const isCorrect = answer.trim().toLowerCase() === exercise.correct_answer.trim().toLowerCase();
      let xpEarned = 0;
      
      if (isCorrect && !previousCorrectAttempt) {
        xpEarned = exercise.xp_value || 10;
      }

      await tx.exercise_attempts.create({
        data: {
          child_id: childId,
          exercise_id: exerciseId,
          correct: isCorrect,
          xp_earned: xpEarned
        }
      });

      const lessonId = exercise.lesson_id;

      // Пересчет прогресса
      const allExercises = await tx.exercises.findMany({
        where: { lesson_id: lessonId }
      });

      const attempts = await Promise.all(
        allExercises.map(ex =>
          tx.exercise_attempts.findFirst({
            where: { child_id: childId, exercise_id: ex.id },
            orderBy: { attempted_at: 'desc' }
          })
        )
      );

      const correctCount = attempts.filter(a => a?.correct === true).length;
      const total = allExercises.length;
      const newScore = total === 0 ? 0 : Math.round((correctCount / total) * 100);
      const isCompleted = newScore >= 80;

      await tx.progress.upsert({
        where: {
          child_id_lesson_id: { child_id: childId, lesson_id: lessonId }
        },
        update: {
          score: newScore,
          completed: isCompleted,
          completed_at: isCompleted ? new Date() : null,
          updated_at: new Date()
        },
        create: {
          child_id: childId,
          lesson_id: lessonId,
          score: newScore,
          completed: isCompleted,
          completed_at: isCompleted ? new Date() : null
        }
      });

      // Обновим gamification
      await GamificationService.updateStreak(childId);
      await GamificationService.refreshBadges(childId);

      return { isCorrect, xpEarned, newScore, isCompleted };
    });
  }

  static async getLessonById(lessonId) {
    const lesson = await LessonModel.findByIdWithExercises(lessonId);
    if (!lesson) throw new Error('NOT_FOUND');
    return lesson;
  }

  static async getAllPublished() {
    return await LessonModel.findAllPublished();
  }
}

module.exports = LessonService;