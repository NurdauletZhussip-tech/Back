
const prisma = require('../prismaClient');

class UnitService {
static async createUnit(data) {
  let orderIndex = parseInt(data.order_index);

  if (!orderIndex || isNaN(orderIndex)) {
    const maxUnit = await prisma.units.aggregate({
      _max: { order_index: true }
    });
    orderIndex = (maxUnit._max.order_index || 0) + 1;
  }

  return await prisma.units.create({
    data: {
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      order_index: orderIndex,
    }
  });
}
  static async getAllUnits() {
    return await prisma.units.findMany({
      orderBy: { order_index: 'asc' },
      include: {
        lessons: {
          where: { is_published: true },
          orderBy: { order_index: 'asc' },
          include: {
            exercises: {
              orderBy: { order_index: 'asc' }
            }
          }
        }
      }
    });
  }

  static async getUnitById(id) {
    return await prisma.units.findUnique({
      where: { id },
      include: { lessons: true }
    });
  }

  static async updateUnit(id, data) {
    try {
      return await prisma.units.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          order_index: parseInt(data.order_index),
          updated_at: new Date()
        }
      });
    } catch (err) {
      if (err.code === 'P2025') throw new Error('NOT_FOUND');
      throw err;
    }
  }

  static async deleteUnit(id) {
    try {
      return await prisma.units.delete({ where: { id } });
    } catch (err) {
      if (err.code === 'P2025') throw new Error('NOT_FOUND');
      throw err;
    }
  }
}

module.exports = UnitService;