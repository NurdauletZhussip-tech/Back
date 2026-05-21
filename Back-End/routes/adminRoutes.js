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
router.put('/units/:id', param('id').notEmpty(), runValidation, UnitController.update);
router.delete('/units/:id', param('id').notEmpty(), runValidation, UnitController.delete);

router.post('/lessons', AdminController.createLesson);
router.get('/lessons', AdminController.getLessons);
router.put('/lessons/:id', param('id').notEmpty(), runValidation, AdminController.updateLesson);
router.delete('/lessons/:id', param('id').notEmpty(), runValidation, AdminController.deleteLesson);

router.post('/badges',
  body('name').notEmpty().withMessage('name required'),
  body('criteria_type').isIn(['lessons_completed','total_xp','streak_days']).withMessage('invalid criteria_type'),
  body('criteria_value').isInt({ min: 1 }).withMessage('criteria_value must be >=1'),
  runValidation,
  AdminController.createBadge
);

router.get('/badges', AdminController.listBadges);
router.get('/badges/:id', param('id').notEmpty(), runValidation, AdminController.getBadge);
router.put('/badges/:id',
  param('id').notEmpty(),
  body('name').optional().notEmpty(),
  body('criteria_type').optional().isIn(['lessons_completed','total_xp','streak_days']),
  body('criteria_value').optional().isInt({ min: 1 }),
  runValidation,
  AdminController.updateBadge
);
router.delete('/badges/:id', param('id').notEmpty(), runValidation, AdminController.deleteBadge);

router.post('/lessons/:lessonId/exercises',
  param('lessonId').notEmpty(),
  body('difficulty').optional().isInt({ min: 1, max: 5 }).withMessage('difficulty must be between 1 and 5'),
  runValidation,
  ExerciseController.create
);
router.get('/lessons/:lessonId/exercises', param('lessonId').notEmpty(), runValidation, ExerciseController.getByLesson);
router.put('/exercises/:id',
  param('id').notEmpty(),
  body('difficulty').optional().isInt({ min: 1, max: 5 }).withMessage('difficulty must be between 1 and 5'),
  runValidation,
  ExerciseController.update
);
router.delete('/exercises/:id', param('id').notEmpty(), runValidation, ExerciseController.delete);

module.exports = router;
