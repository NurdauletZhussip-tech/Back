const UnitService = require('../services/unitService');
const asyncHandler = require('../middleware/asyncHandler');

class UnitController {
  static create = asyncHandler(async (req, res) => {
    const unit = await UnitService.createUnit(req.body);
    res.status(201).json(unit);
  });

  static getAll = asyncHandler(async (req, res) => {
    const units = await UnitService.getAllUnits();
    res.json(units);
  });

  static update = asyncHandler(async (req, res) => {
    const unit = await UnitService.updateUnit(req.params.id, req.body);
    res.json(unit);
  });

  static delete = asyncHandler(async (req, res) => {
    await UnitService.deleteUnit(req.params.id);
    res.json({ message: 'Unit deleted' });
  });
}

module.exports = UnitController;
