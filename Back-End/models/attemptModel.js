const prisma = require('../prismaClient');

class AttemptModel {
  static async create({ childId, exerciseId, correct, xpEarned }) {
    return await prisma.exercise_attempts.create({
      data: { child_id: childId, exercise_id: exerciseId, correct, xp_earned: xpEarned }
    });
  }

  static async sumXpByChild(childId) {
    const result = await prisma.exercise_attempts.aggregate({
      where: { child_id: childId },
      _sum: { xp_earned: true }
    });
    return result._sum.xp_earned || 0;
  }

  static async getLastCorrectPerExercise(childId, lessonId) {
    const exercises = await prisma.exercises.findMany({
      where: { lesson_id: lessonId },
      select: {
        id: true,
        exercise_attempts: {
          where: { child_id: childId },
          orderBy: { attempted_at: 'desc' },
          take: 1,
          select: { correct: true }
        }
      }
    });
    return exercises.map(e => ({
      id: e.id,
      last_correct: e.exercise_attempts[0] ? e.exercise_attempts[0].correct : null
    }));
  }
}
module.exports = AttemptModel;