const LessonModel = require('../models/lessonModel');
const LessonService = require('../services/lessonService');
const ExerciseModel = require('../models/exerciseModel');
const prisma = require('../prismaClient');

exports.getLessons = async (req, res) => {
  try {
    const result = await LessonService.getAllLessonsPaginated(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getExercisesByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const result = await LessonService.getExercisesPaginated(lessonId, req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitExercise = async (req, res) => {
  try {
    const { childId, exerciseId } = req.params;
    const { answer } = req.body;
    if (!answer) return res.status(400).json({ error: 'Answer required' });
    const result = await LessonService.submitExercise(childId, exerciseId, answer);
    res.json(result);
  } catch (err) {
    if (err.message === 'EXERCISE_NOT_FOUND') return res.status(404).json({ error: 'Exercise not found' });
    res.status(500).json({ error: err.message });
  }
};

exports.getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await prisma.lessons.findUnique({
      where: { id: lessonId },
      include: {
        exercises: true  
      }
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};