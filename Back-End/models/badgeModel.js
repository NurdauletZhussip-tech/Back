const prisma = require('../prismaClient');

class BadgeModel {
  static async findByCriteria(criteriaType, value) {
    return await prisma.badges.findMany({
      where: {
        criteria_type: criteriaType,
        criteria_value: { lte: value }
      }
    });
  }
}
module.exports = BadgeModel;