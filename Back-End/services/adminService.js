const prisma = require('../prismaClient');

class AdminService {
// services/adminService.js
  static async createLesson(data) {
    let orderIndex = parseInt(data.order_index);

    if (!orderIndex || isNaN(orderIndex)) {
      const maxLesson = await prisma.lessons.aggregate({
        _max: { order_index: true }
      });
      orderIndex = (maxLesson._max.order_index || 0) + 1;
    }

    return await prisma.lessons.create({
      data: {
        title: data.title.trim(),
        description: data.description ? data.description.trim() : '',
        order_index: orderIndex,
        xp_reward: parseInt(data.xp_reward) || 50,
        unit_id: data.unit_id || null,
        is_published: true,
      }
    });
  }

  // adminService.js
static async getLessonsPaginated(query) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 50;

  const [lessons, totalCount] = await Promise.all([
    prisma.lessons.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { order_index: 'asc' },
      include: {
        units: true 
      }
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