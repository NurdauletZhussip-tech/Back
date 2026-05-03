
const LessonService = require('../services/lessonService');
const etag = require('etag');

exports.getLessons = async (req, res) => {
  try {
    const result = await LessonService.getAllLessonsPaginated(req.query);
    const body = JSON.stringify(result);
    const generatedEtag = etag(body);
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.setHeader('ETag', generatedEtag);
    if (req.headers['if-none-match'] === generatedEtag) {
      return res.status(304).end();
    }
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

    if (!answer) {
      return res.status(400).json({ error: 'Answer required' });
    }

    const result = await LessonService.submitExercise(childId, exerciseId, answer);
    res.json(result);
  } catch (err) {
    if (err.message === 'EXERCISE_NOT_FOUND') {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await LessonService.getLessonById(lessonId);
    const body = JSON.stringify(lesson);
    const generatedEtag = etag(body);
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.setHeader('ETag', generatedEtag);
    if (req.headers['if-none-match'] === generatedEtag) {
      return res.status(304).end();
    }
    res.json(lesson);
  } catch (err) {
    if (err.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.status(500).json({ error: err.message });
  }
};