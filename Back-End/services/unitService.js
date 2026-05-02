const UnitModel = require('../models/unitModel');

class UnitService {
  static async createUnit(data) {
    const orderIndex = data.order_index
      ? parseInt(data.order_index)
      : (await UnitModel.getMaxOrderIndex()) + 1;

    return await UnitModel.create({
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      order_index: orderIndex
    });
  }

  static async getAllUnits() {
    return await UnitModel.findAllWithLessons();
  }

  static async getUnitById(id) {
    const unit = await UnitModel.findByIdWithLessons(id);
    if (!unit) throw new Error('NOT_FOUND');
    return unit;
  }

  static async updateUnit(id, data) {
    return await UnitModel.update(id, {
      title: data.title,
      description: data.description,
      order_index: parseInt(data.order_index),
      updated_at: new Date()
    });
  }

  static async deleteUnit(id) {
    return await UnitModel.delete(id);
  }
}

module.exports = UnitService;