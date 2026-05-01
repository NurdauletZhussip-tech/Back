
const ExerciseService = require('../services/exerciseService');

class ExerciseController {
  static async create(req, res) {
    try {
      const { lessonId } = req.params;
      const exercise = await ExerciseService.createExercise(lessonId, req.body);
      res.status(201).json(exercise);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getByLesson(req, res) {
    try {
      const { lessonId } = req.params;
      const exercises = await ExerciseService.getExercisesByLesson(lessonId);
      res.json(exercises);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const updated = await ExerciseService.updateExercise(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'Упражнение не найдено' });
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      await ExerciseService.deleteExercise(req.params.id);
      res.json({ message: 'Упражнение удалено' });
    } catch (err) {
      if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'Упражнение не найдено' });
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = ExerciseController;