const prisma = require('../prismaClient');

class NotificationModel {
  static async create({ userId, type, message }) {
    return await prisma.notifications.create({
      data: { user_id: userId, type: type, message: message }
    });
  }
}
module.exports = NotificationModel;