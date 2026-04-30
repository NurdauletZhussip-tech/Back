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
}
module.exports = ProgressModel;