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

  static async create(data) {
    return await prisma.exercises.create({
      data
    });
  }

  static async update(id, data) {
    try {
      return await prisma.exercises.update({
        where: { id },
        data
      });
    } catch (err) {
      if (err.code === 'P2025') throw new Error('NOT_FOUND');
      throw err;
    }
  }

  static async delete(id) {
    try {
      return await prisma.exercises.delete({
        where: { id }
      });
    } catch (err) {
      if (err.code === 'P2025') throw new Error('NOT_FOUND');
      throw err;
    }
  }

  static async findByLessonIdPaginated(lessonId, skip, take) {
    return await prisma.exercises.findMany({
      where: { lesson_id: lessonId },
      skip,
      take,
      orderBy: { order_index: 'asc' }
    });
  }

  static async countByLessonId(lessonId) {
    return await prisma.exercises.count({
      where: { lesson_id: lessonId }
    });
  }
}
module.exports = ExerciseModel;