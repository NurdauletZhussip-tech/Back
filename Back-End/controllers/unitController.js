const UnitService = require('../services/unitService');

class UnitController {
  static async create(req, res) {
    try {
      const unit = await UnitService.createUnit(req.body);
      res.status(201).json(unit);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getAll(req, res) {
    try {
      const units = await UnitService.getAllUnits();
      res.json(units);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const unit = await UnitService.updateUnit(req.params.id, req.body);
      res.json(unit);
    } catch (err) {
      if (err.message === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Юнит не найден' });
      }
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      await UnitService.deleteUnit(req.params.id);
      res.json({ message: 'Юнит успешно удалён' });
    } catch (err) {
      if (err.message === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Юнит не найден' });
      }
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = UnitController;