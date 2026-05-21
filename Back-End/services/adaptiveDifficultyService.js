const prisma = require('../prismaClient');

class AdaptiveDifficultyService {
  static async getRecommendedDifficulty(childId) {
    const attempts = await prisma.exercise_attempts.findMany({
      where: { child_id: childId },
      orderBy: { attempted_at: 'desc' },
      take: 10,
      include: {
        exercises: {
          select: { difficulty: true }
        }
      }
    });

    if (attempts.length < 3) return 1;

    const correctRate = attempts.filter(attempt => attempt.correct).length / attempts.length;
    const averageDifficulty = attempts.reduce((sum, attempt) => {
      return sum + (attempt.exercises?.difficulty || 1);
    }, 0) / attempts.length;

    if (correctRate >= 0.8) return Math.min(5, Math.round(averageDifficulty) + 1);
    if (correctRate <= 0.5) return Math.max(1, Math.round(averageDifficulty) - 1);
    return Math.max(1, Math.min(5, Math.round(averageDifficulty)));
  }

  static async getAdaptiveExercises(lessonId, childId, { skip = 0, take = 10 } = {}) {
    const recommendedDifficulty = await this.getRecommendedDifficulty(childId);
    const where = { lesson_id: lessonId, difficulty: recommendedDifficulty };

    let [data, total] = await Promise.all([
      prisma.exercises.findMany({ where, skip, take, orderBy: { order_index: 'asc' } }),
      prisma.exercises.count({ where })
    ]);

    if (total === 0) {
      const fallbackWhere = { lesson_id: lessonId };
      [data, total] = await Promise.all([
        prisma.exercises.findMany({ where: fallbackWhere, skip, take, orderBy: [{ difficulty: 'asc' }, { order_index: 'asc' }] }),
        prisma.exercises.count({ where: fallbackWhere })
      ]);
    }

    return { data, total, recommendedDifficulty };
  }
}

module.exports = AdaptiveDifficultyService;
