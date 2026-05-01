
const prisma = require('../prismaClient');

class ExerciseService {
  static async createExercise(lessonId, data) {
    return await prisma.exercises.create({
      data: {
        lesson_id: lessonId,
        type: data.type,
        question_data: data.question_data,
        correct_answer: data.correct_answer,
        xp_value: data.xp_value || 10,
        order_index: data.order_index || 0,
      }
    });
  }

  static async getExercisesByLesson(lessonId) {
    return await prisma.exercises.findMany({
      where: { lesson_id: lessonId },
      orderBy: { order_index: 'asc' }
    });
  }

  static async updateExercise(id, data) {
    try {
      return await prisma.exercises.update({ where: { id }, data });
    } catch (err) {
      if (err.code === 'P2025') throw new Error('NOT_FOUND');
      throw err;
    }
  }

  static async deleteExercise(id) {
    try {
      return await prisma.exercises.delete({ where: { id } });
    } catch (err) {
      if (err.code === 'P2025') throw new Error('NOT_FOUND');
      throw err;
    }
  }
}

module.exports = ExerciseService;