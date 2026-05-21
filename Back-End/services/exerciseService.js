const ExerciseModel = require('../models/exerciseModel');

class ExerciseService {
  static async createExercise(lessonId, data) {
    return await ExerciseModel.create({
      lesson_id: lessonId,
      type: data.type,
      question_data: data.question_data,
      correct_answer: data.correct_answer,
      difficulty: parseInt(data.difficulty, 10) || 1,
      xp_value: data.xp_value || 10,
      order_index: data.order_index || 0
    });
  }

  static async getExercisesByLesson(lessonId) {
    return await ExerciseModel.findByLessonId(lessonId);
  }

  static async updateExercise(id, data) {
    const update = { ...data };
    if (update.difficulty !== undefined) update.difficulty = parseInt(update.difficulty, 10);
    if (update.xp_value !== undefined) update.xp_value = parseInt(update.xp_value, 10);
    if (update.order_index !== undefined) update.order_index = parseInt(update.order_index, 10);
    return await ExerciseModel.update(id, update);
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
