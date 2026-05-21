const UnitService = require('../services/unitService');
const AuditLogService = require('../services/auditLogService');
const asyncHandler = require('../middleware/asyncHandler');

class UnitController {
  static create = asyncHandler(async (req, res) => {
    const unit = await UnitService.createUnit(req.body);
    await AuditLogService.log({
      userId: req.userId,
      action: 'CREATE_UNIT',
      entity: 'unit',
      entityId: unit.id,
      after: unit
    });
    res.status(201).json(unit);
  });

  static getAll = asyncHandler(async (req, res) => {
    const units = await UnitService.getAllUnits();
    res.json(units);
  });

  static update = asyncHandler(async (req, res) => {
    const before = await UnitService.getUnitById(req.params.id);
    const unit = await UnitService.updateUnit(req.params.id, req.body);
    await AuditLogService.log({
      userId: req.userId,
      action: 'UPDATE_UNIT',
      entity: 'unit',
      entityId: req.params.id,
      before,
      after: unit
    });
    res.json(unit);
  });

  static delete = asyncHandler(async (req, res) => {
    const before = await UnitService.getUnitById(req.params.id);
    await UnitService.deleteUnit(req.params.id);
    await AuditLogService.log({
      userId: req.userId,
      action: 'DELETE_UNIT',
      entity: 'unit',
      entityId: req.params.id,
      before
    });
    res.json({ message: 'Unit deleted' });
  });
}

module.exports = UnitController;
