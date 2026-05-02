const prisma = require('../prismaClient');
const GamificationService = require('./gamificationService');

class LessonService {

  static async getAllLessonsPaginated(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20; 

    const [data, total] = await Promise.all([
      prisma.lessons.findMany({
        where: { is_published: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { order_index: 'asc' },
        include: {
          units: true,          
          exercises: {
            orderBy: { order_index: 'asc' }
          }
        }
      }),
      prisma.lessons.count({ where: { is_published: true } })
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

      return { isCorrect, xpEarned, newScore, isCompleted };
    });
  }
}

module.exports = LessonService;