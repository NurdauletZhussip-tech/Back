const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');
const { runValidation } = require('../middleware/validation');
const ExerciseController = require('../controllers/exerciseController');
const UnitController = require('../controllers/unitController');

router.use(authenticate, requireRole('admin'));

router.post('/units', UnitController.create);
router.get('/units', UnitController.getAll);
router.put('/units/:id', UnitController.update);
router.delete('/units/:id', UnitController.delete);

router.post('/lessons', AdminController.createLesson);
router.get('/lessons', AdminController.getLessons);
router.put('/lessons/:id', AdminController.updateLesson);
router.delete('/lessons/:id', AdminController.deleteLesson);

router.post('/badges',
  body('name').notEmpty().withMessage('name required'),
  body('criteria_type').isIn(['lessons_completed','total_xp','streak_days']).withMessage('invalid criteria_type'),
  body('criteria_value').isInt({ min: 1 }).withMessage('criteria_value must be >=1'),
  runValidation,
  AdminController.createBadge
);

router.get('/badges', AdminController.listBadges);
router.get('/badges/:id', AdminController.getBadge);
router.put('/badges/:id',
  param('id').notEmpty(),
  body('name').optional().notEmpty(),
  body('criteria_type').optional().isIn(['lessons_completed','total_xp','streak_days']),
  body('criteria_value').optional().isInt({ min: 1 }),
  runValidation,
  AdminController.updateBadge
);
router.delete('/badges/:id', AdminController.deleteBadge);
router.get('/badges/:id', AdminController.getBadge);
router.put('/badges/:id', AdminController.updateBadge);
router.delete('/badges/:id', AdminController.deleteBadge);

router.post('/lessons/:lessonId/exercises', ExerciseController.create);
router.get('/lessons/:lessonId/exercises', ExerciseController.getByLesson);
router.put('/exercises/:id', ExerciseController.update);
router.delete('/exercises/:id', ExerciseController.delete);

module.exports = router;