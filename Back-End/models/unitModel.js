const prisma = require('../prismaClient');

class UnitModel {
  static async create(data) {
    return await prisma.units.create({
      data
    });
  }

  static async findAll(skip, take) {
    return await prisma.units.findMany({
      skip,
      take,
      orderBy: { order_index: 'asc' }
    });
  }

  static async findAllWithLessons() {
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

  static async findById(id) {
    return await prisma.units.findUnique({
      where: { id }
    });
  }

  static async findByIdWithLessons(id) {
    return await prisma.units.findUnique({
      where: { id },
      include: { lessons: true }
    });
  }

  static async update(id, data) {
    try {
      return await prisma.units.update({
        where: { id },
        data
      });
    } catch (err) {
      if (err.code === 'P2025') throw new Error('NOT_FOUND');
      throw err;
    }
  }

  static async delete(id) {
    try {
      return await prisma.units.delete({
        where: { id }
      });
    } catch (err) {
      if (err.code === 'P2025') throw new Error('NOT_FOUND');
      throw err;
    }
  }

  static async count() {
    return await prisma.units.count();
  }

  static async getMaxOrderIndex() {
    const result = await prisma.units.aggregate({
      _max: { order_index: true }
    });
    return result._max.order_index || 0;
  }
}

module.exports = UnitModel;

