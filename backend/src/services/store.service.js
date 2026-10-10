const { Op } = require('sequelize');
const { Store, Rating, User, sequelize } = require('../models');
const ApiError = require('../utils/apiError');

class StoreService {
  async getStores({ page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC', currentUserId = null }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const allowedSortFields = {
      name: 'name',
      address: 'address',
      created_at: 'created_at',
      rating: 'average_rating',
      average_rating: 'average_rating',
    };

    const targetSort = allowedSortFields[sortBy] || 'created_at';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const whereConditions = [];
    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      whereConditions.push({
        [Op.or]: [
          { name: { [Op.like]: term } },
          { address: { [Op.like]: term } },
        ],
      });
    }

    const where = whereConditions.length > 0 ? { [Op.and]: whereConditions } : {};

    const attributes = [
      'id',
      'name',
      'email',
      'address',
      'created_at',
      'updated_at',
      [
        sequelize.literal(`(
          SELECT COALESCE(ROUND(AVG(rating), 1), 0)
          FROM ratings
          WHERE ratings.store_id = Store.id
        )`),
        'average_rating',
      ],
      [
        sequelize.literal(`(
          SELECT COUNT(*)
          FROM ratings
          WHERE ratings.store_id = Store.id
        )`),
        'total_ratings',
      ],
    ];

    if (currentUserId) {
      attributes.push([
        sequelize.literal(`(
          SELECT rating
          FROM ratings
          WHERE ratings.store_id = Store.id AND ratings.user_id = ${parseInt(currentUserId, 10)}
          LIMIT 1
        )`),
        'user_rating',
      ]);
    }

    const orderClause =
      targetSort === 'average_rating'
        ? [[sequelize.literal('average_rating'), direction]]
        : [[targetSort, direction]];

    const { count, rows } = await Store.findAndCountAll({
      where,
      attributes,
      order: orderClause,
      limit: limitNum,
      offset,
    });

    return {
      stores: rows,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum) || 1,
      },
    };
  }

  async getStoreById(id, currentUserId = null) {
    const attributes = [
      'id',
      'name',
      'email',
      'address',
      'created_at',
      'updated_at',
      [
        sequelize.literal(`(
          SELECT COALESCE(ROUND(AVG(rating), 1), 0)
          FROM ratings
          WHERE ratings.store_id = Store.id
        )`),
        'average_rating',
      ],
      [
        sequelize.literal(`(
          SELECT COUNT(*)
          FROM ratings
          WHERE ratings.store_id = Store.id
        )`),
        'total_ratings',
      ],
    ];

    if (currentUserId) {
      attributes.push([
        sequelize.literal(`(
          SELECT rating
          FROM ratings
          WHERE ratings.store_id = Store.id AND ratings.user_id = ${parseInt(currentUserId, 10)}
          LIMIT 1
        )`),
        'user_rating',
      ]);
    }

    const store = await Store.findByPk(id, {
      attributes,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!store) {
      throw ApiError.notFound('Store not found');
    }

    return store;
  }
}

module.exports = new StoreService();
