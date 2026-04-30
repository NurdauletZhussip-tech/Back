const prisma = require('../prismaClient');

class AdminService {
  static async createLesson(data) {
    return await prisma.lessons.create({ data });
  }

  static async getLessonsPaginated(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [lessons, totalCount] = await Promise.all([
      prisma.lessons.findMany({
        skip,
        take: limit,
        orderBy: { order_index: 'asc' }
      }),
      prisma.lessons.count()
    ]);

    return {
      data: lessons,
      meta: {
        totalItems: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        itemsPerPage: limit
      }
    };
  }

  static async updateLesson(id, data) {
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

  static async deleteLesson(id) {
    try {
      return await prisma.lessons.delete({
        where: { id }
      });
    } catch (err) {
      if (err.code === 'P2025') throw new Error('NOT_FOUND');
      throw err;
    }
  }
}

module.exports = AdminService;