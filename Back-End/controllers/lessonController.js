const LessonModel = require('../models/lessonModel');
const LessonService = require('../services/lessonService');

exports.getLessons = async (req, res) => {
  try {
    const lessons = await LessonModel.findAll();
    res.json(lessons);
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

const ExerciseModel = require('../models/exerciseModel');

exports.getExercisesByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const exercises = await ExerciseModel.findByLessonId(lessonId);
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};