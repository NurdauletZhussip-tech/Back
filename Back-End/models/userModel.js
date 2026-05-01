// models/userModel.js
const prisma = require('../prismaClient');

class UserModel {
  static async findByEmail(email) {
    return await prisma.users.findUnique({
      where: { email: email }
    });
  }

  static async findById(id) {
    return await prisma.users.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        role: true,
        parent_id: true,
        name: true,
        pin: true,
        avatar_url: true
      }
    });
  }

  static async findChildrenByParent(parentId) {
    return await prisma.users.findMany({
      where: {
        parent_id: parentId,
        role: 'child'
      },
      select: {
        id: true,
        name: true,
        avatar_url: true,
        created_at: true
      },
      orderBy: { name: 'asc' }
    });
  }

  static async createParent({ email, password_hash, name }) {
      return await prisma.users.create({
        data: {
          email: email,
          password_hash: password_hash,
          role: 'parent',
          name: name
        },
        select: {
          id: true,
          email: true,
          role: true,
          name: true
        }
      });
    }

  static async createChild({ parentId, name, pinHash }) {
    return await prisma.users.create({
      data: {
        parent_id: parentId,
        role: 'child',
        name: name,
        pin: pinHash
      },
      select: {
        id: true,
        name: true,
        role: true,
        parent_id: true
      }
    });
  }
}

module.exports = UserModel;