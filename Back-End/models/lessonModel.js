const prisma = require('../prismaClient');

class LessonModel {
  static async findAll() {
    return await prisma.lessons.findMany({
      orderBy: { order_index: 'asc' }
    });
  }

  static async findById(id) {
    return await prisma.lessons.findUnique({
      where: { id: id }
    });
  }

  static async findByIdWithExercises(id) {
    return await prisma.lessons.findUnique({
      where: { id },
      include: {
        exercises: {
          orderBy: { order_index: 'asc' }
        }
      }
    });
  }

  static async findPublished(skip, take) {
    return await prisma.lessons.findMany({
      where: { is_published: true },
      skip,
      take,
      orderBy: { order_index: 'asc' },
      include: {
        units: true,
        exercises: {
          orderBy: { order_index: 'asc' }
        }
      }
    });
  }

  static async countPublished() {
    return await prisma.lessons.count({ where: { is_published: true } });
  }

  static async create(data) {
    return await prisma.lessons.create({
      data
    });
  }

  static async update(id, data) {
    try {
      return await prisma.lessons.update({
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
      return await prisma.lessons.delete({
        where: { id }
      });
    } catch (err) {
      if (err.code === 'P2025') throw new Error('NOT_FOUND');
      throw err;
    }
  }

  static async findAllWithoutPagination() {
    return await prisma.lessons.findMany({
      orderBy: { order_index: 'asc' },
      include: {
        exercises: true
      }
    });
  }

  static async getMaxOrderIndex() {
    const result = await prisma.lessons.aggregate({
      _max: { order_index: true }
    });
    return result._max.order_index || 0;
  }

  static async findAllPublished() {
    return await prisma.lessons.findMany({
      where: { is_published: true },
      orderBy: { order_index: 'asc' },
      include: {
        units: true,
        exercises: {
          orderBy: { order_index: 'asc' }
        }
      }
    });
  }
}
module.exports = LessonModel;