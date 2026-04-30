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
}
module.exports = LessonModel;