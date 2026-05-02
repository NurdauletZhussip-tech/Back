const AdminService = require('../services/adminService');

class AdminController {
  static async getLessons(req, res) {
    try {
      const result = await AdminService.getLessonsPaginated(req.query);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async createLesson(req, res) {
    try {
      const lesson = await AdminService.createLesson(req.body);
      res.status(201).json(lesson);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateLesson(req, res) {
    try {
      const updatedLesson = await AdminService.updateLesson(req.params.id, req.body);
      res.json(updatedLesson);
    } catch (err) {
      if (err.message === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Урок не найден' });
      }
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteLesson(req, res) {
    try {
      await AdminService.deleteLesson(req.params.id);
      res.json({ message: 'Урок успешно удален' });
    } catch (err) {
      if (err.message === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Урок не найден' });
      }
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = AdminController;