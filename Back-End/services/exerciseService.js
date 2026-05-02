const ExerciseModel = require('../models/exerciseModel');

class ExerciseService {
  static async createExercise(lessonId, data) {
    return await ExerciseModel.create({
      lesson_id: lessonId,
      type: data.type,
      question_data: data.question_data,
      correct_answer: data.correct_answer,
      xp_value: data.xp_value || 10,
      order_index: data.order_index || 0
    });
  }

  static async getExercisesByLesson(lessonId) {
    return await ExerciseModel.findByLessonId(lessonId);
  }

  static async updateExercise(id, data) {
    return await ExerciseModel.update(id, data);
  }

  static async deleteExercise(id) {
    return await ExerciseModel.delete(id);
  }

  static async getExerciseById(id) {
    const exercise = await ExerciseModel.findById(id);
    if (!exercise) throw new Error('NOT_FOUND');
    return exercise;
  }
}

module.exports = ExerciseService;