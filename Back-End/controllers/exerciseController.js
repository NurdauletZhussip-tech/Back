const ExerciseService = require('../services/exerciseService');
const AuditLogService = require('../services/auditLogService');
const asyncHandler = require('../middleware/asyncHandler');

class ExerciseController {
  static create = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const exercise = await ExerciseService.createExercise(lessonId, req.body);
    await AuditLogService.log({
      userId: req.userId,
      action: 'CREATE_EXERCISE',
      entity: 'exercise',
      entityId: exercise.id,
      after: exercise
    });
    res.status(201).json(exercise);
  });

  static getByLesson = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const exercises = await ExerciseService.getExercisesByLesson(lessonId);
    res.json(exercises);
  });

  static update = asyncHandler(async (req, res) => {
    const before = await ExerciseService.getExerciseById(req.params.id);
    const updated = await ExerciseService.updateExercise(req.params.id, req.body);
    await AuditLogService.log({
      userId: req.userId,
      action: 'UPDATE_EXERCISE',
      entity: 'exercise',
      entityId: req.params.id,
      before,
      after: updated
    });
    res.json(updated);
  });

  static delete = asyncHandler(async (req, res) => {
    const before = await ExerciseService.getExerciseById(req.params.id);
    await ExerciseService.deleteExercise(req.params.id);
    await AuditLogService.log({
      userId: req.userId,
      action: 'DELETE_EXERCISE',
      entity: 'exercise',
      entityId: req.params.id,
      before
    });
    res.json({ message: 'Exercise deleted' });
  });
}

module.exports = ExerciseController;
