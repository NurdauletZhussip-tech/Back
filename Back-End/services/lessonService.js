const prisma = require('../prismaClient');
const GamificationService = require('./gamificationService');

class LessonService {
  static async getAllLessonsPaginated(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    return await prisma.lessons.paginate({
      page,
      limit,
      where: { is_published: true },
      orderBy: { order_index: 'asc' }
    });
  }

  static async getExercisesPaginated(lessonId, query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    return await prisma.exercises.paginate({
      page,
      limit,
      where: { lesson_id: lessonId },
      orderBy: { order_index: 'asc' }
    });
  }

  static async submitExercise(childId, exerciseId, answer) {
    return await prisma.$transaction(async (tx) => {
      const exercise = await tx.exercises.findUnique({
        where: { id: exerciseId }
      });

      if (!exercise) throw new Error('EXERCISE_NOT_FOUND');

      const isCorrect = answer.trim().toLowerCase() === exercise.correct_answer.trim().toLowerCase();
      const xpEarned = isCorrect ? exercise.xp_value : 0;

      await tx.exercise_attempts.create({
        data: {
          child_id: childId,
          exercise_id: exerciseId,
          correct: isCorrect,
          xp_earned: xpEarned
        }
      });

      const lessonId = exercise.lesson_id;

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

      await GamificationService.updateStreak(childId);
      await GamificationService.refreshBadges(childId);

      return { isCorrect, newScore, isCompleted };
    });
  }
}

module.exports = LessonService;