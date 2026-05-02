const prisma = require('../prismaClient');

class ProgressModel {
  static async findByChildAndLesson(childId, lessonId) {
    return await prisma.progress.findUnique({
      where: { child_id_lesson_id: { child_id: childId, lesson_id: lessonId } }
    });
  }

  static async createOrUpdate({ childId, lessonId, completed, score, completedAt }) {
    return await prisma.progress.upsert({
      where: { child_id_lesson_id: { child_id: childId, lesson_id: lessonId } },
      update: { completed, score, completed_at: completedAt, updated_at: new Date() },
      create: { child_id: childId, lesson_id: lessonId, completed, score, completed_at: completedAt }
    });
  }

  static async upsert(childId, lessonId, data) {
    return await prisma.progress.upsert({
      where: { child_id_lesson_id: { child_id: childId, lesson_id: lessonId } },
      update: {
        score: data.score,
        completed: data.completed,
        completed_at: data.completed_at,
        updated_at: new Date()
      },
      create: {
        child_id: childId,
        lesson_id: lessonId,
        score: data.score,
        completed: data.completed,
        completed_at: data.completed_at
      }
    });
  }

  static async countCompletedByChild(childId) {
    return await prisma.progress.count({
      where: { child_id: childId, completed: true }
    });
  }

  static async findAllByChild(childId, skip, take) {
    return await prisma.progress.findMany({
      where: { child_id: childId },
      skip,
      take,
      include: { lessons: true }
    });
  }
}
module.exports = ProgressModel;