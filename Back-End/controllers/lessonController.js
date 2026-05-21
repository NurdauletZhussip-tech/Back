const LessonService = require('../services/lessonService');
const asyncHandler = require('../middleware/asyncHandler');
const { sendCachedJson } = require('../utils/controllerHelpers');

exports.getLessons = asyncHandler(async (req, res) => {
  const result = await LessonService.getAllLessonsPaginated(req.query);
  sendCachedJson(req, res, result);
});

exports.getAllPublished = asyncHandler(async (req, res) => {
  const lessons = await LessonService.getAllPublished();
  sendCachedJson(req, res, lessons, 300);
});

exports.getExercisesByLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const result = await LessonService.getExercisesPaginated(lessonId, req.query);
  sendCachedJson(req, res, result, 300);
});

exports.getAdaptiveExercisesByLesson = asyncHandler(async (req, res) => {
  const { lessonId, childId } = req.params;
  const result = await LessonService.getAdaptiveExercisesPaginated(lessonId, childId, req.query);
  res.json(result);
});

exports.submitExercise = asyncHandler(async (req, res) => {
  const { childId, exerciseId } = req.params;
  const { answer } = req.body;
  const result = await LessonService.submitExercise(childId, exerciseId, answer);
  res.json(result);
});

exports.getLessonById = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const lesson = await LessonService.getLessonById(lessonId);
  sendCachedJson(req, res, lesson);
});
