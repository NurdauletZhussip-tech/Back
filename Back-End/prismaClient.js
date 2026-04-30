const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

const adapter = new PrismaPg(pool);

const basePrisma = new PrismaClient({ adapter });

const prisma = basePrisma.$extends({
  model: {
    $allModels: {
      async paginate({ page = 1, limit = 10, where = {}, orderBy = { id: 'asc' }, include = {} }) {
        const skip = (page - 1) * limit;
        const take = limit;

        const [data, totalItems] = await Promise.all([
          this.findMany({
            where,
            take,
            skip,
            orderBy,
            include
          }),
          this.count({ where })
        ]);

        return {
          data,
          meta: {
            totalItems,
            itemCount: data.length,
            itemsPerPage: limit,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page
          }
        };
      }
    }
  }
});

module.exports = prisma;