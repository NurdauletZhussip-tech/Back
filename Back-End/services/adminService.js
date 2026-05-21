const LessonModel = require('../models/lessonModel');
const { buildPaginationMeta, getPagination } = require('../utils/pagination');

class AdminService {
  static async createLesson(data) {
    const orderIndex = data.order_index
      ? parseInt(data.order_index)
      : (await LessonModel.getMaxOrderIndex()) + 1;

    return await LessonModel.create({
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      order_index: orderIndex,
      xp_reward: parseInt(data.xp_reward) || 50,
      unit_id: data.unit_id || null,
      is_published: true
    });
  }

  static async getLessonsPaginated(query) {
    const { page, limit, skip } = getPagination(query, 50);

    const [lessons, totalCount] = await Promise.all([
      LessonModel.findAll(skip, limit),
      LessonModel.countAll()
    ]);

    return {
      data: lessons,
      meta: buildPaginationMeta(totalCount, page, limit)
    };
  }

  static async updateLesson(id, data) {
    return await LessonModel.update(id, data);
  }

  static async deleteLesson(id) {
    return await LessonModel.delete(id);
  }
}

module.exports = AdminService;
