const prisma = require('../prismaClient');

class ExerciseModel {
  static async findByLessonId(lessonId) {
    return await prisma.exercises.findMany({
      where: { lesson_id: lessonId },
      orderBy: { order_index: 'asc' }
    });
  }

  static async findById(id) {
    return await prisma.exercises.findUnique({
      where: { id: id }
    });
  }
}
module.exports = ExerciseModel;