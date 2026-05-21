const ExerciseService = require('../services/exerciseService');
const asyncHandler = require('../middleware/asyncHandler');

class ExerciseController {
  static create = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const exercise = await ExerciseService.createExercise(lessonId, req.body);
    res.status(201).json(exercise);
  });

  static getByLesson = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const exercises = await ExerciseService.getExercisesByLesson(lessonId);
    res.json(exercises);
  });

  static update = asyncHandler(async (req, res) => {
    const updated = await ExerciseService.updateExercise(req.params.id, req.body);
    res.json(updated);
  });

  static delete = asyncHandler(async (req, res) => {
    await ExerciseService.deleteExercise(req.params.id);
    res.json({ message: 'Exercise deleted' });
  });
}

module.exports = ExerciseController;
