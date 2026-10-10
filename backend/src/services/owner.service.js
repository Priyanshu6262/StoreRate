const { Op } = require('sequelize');
const { Store, Rating, User, sequelize } = require('../models');

class OwnerService {
  async getOwnerDashboard(ownerId, targetStoreId = null) {
    const stores = await Store.findAll({
      where: { owner_id: ownerId },
      order: [['id', 'ASC']],
    });

    if (!stores || stores.length === 0) {
      return {
        store: null,
        stores: [],
        averageRating: 0,
        totalRatings: 0,
        ratingsDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    let activeStore = stores[0];
    if (targetStoreId) {
      const found = stores.find((s) => s.id === parseInt(targetStoreId, 10));
      if (found) activeStore = found;
    }

    const [stats] = await Rating.findAll({
      where: { store_id: activeStore.id },
      attributes: [
        [sequelize.fn('COALESCE', sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('rating')), 1), 0), 'average_rating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_ratings'],
      ],
      raw: true,
    });

    // Rating breakdown (1 to 5 stars)
    const distributionRaw = await Rating.findAll({
      where: { store_id: activeStore.id },
      attributes: ['rating', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['rating'],
      raw: true,
    });

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distributionRaw.forEach((item) => {
      distribution[item.rating] = parseInt(item.count, 10);
    });

    return {
      store: {
        id: activeStore.id,
        name: activeStore.name,
        email: activeStore.email,
        address: activeStore.address,
        createdAt: activeStore.created_at,
      },
      stores: stores.map((s) => ({ id: s.id, name: s.name })),
      averageRating: stats ? parseFloat(stats.average_rating) || 0 : 0,
      totalRatings: stats ? parseInt(stats.total_ratings, 10) || 0 : 0,
      ratingsDistribution: distribution,
    };
  }

  async getOwnerRatings(ownerId, { storeId = null, page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC' }) {
    const stores = await Store.findAll({
      where: { owner_id: ownerId },
      order: [['id', 'ASC']],
    });

    if (!stores || stores.length === 0) {
      return {
        store: null,
        stores: [],
        ratings: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
      };
    }

    let activeStore = stores[0];
    if (storeId) {
      const found = stores.find((s) => s.id === parseInt(storeId, 10));
      if (found) activeStore = found;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Allowed sorting fields: name, email, rating, date, created_at
    let orderClause = [['created_at', direction]];
    if (sortBy === 'name') {
      orderClause = [[{ model: User, as: 'user' }, 'name', direction]];
    } else if (sortBy === 'email') {
      orderClause = [[{ model: User, as: 'user' }, 'email', direction]];
    } else if (sortBy === 'rating') {
      orderClause = [['rating', direction]];
    } else if (sortBy === 'date' || sortBy === 'created_at') {
      orderClause = [['created_at', direction]];
    }

    const userWhere = {};
    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      userWhere[Op.or] = [
        { name: { [Op.like]: term } },
        { email: { [Op.like]: term } },
      ];
    }

    const { count, rows } = await Rating.findAndCountAll({
      where: { store_id: activeStore.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'address'],
          where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
          required: true,
        },
      ],
      order: orderClause,
      limit: limitNum,
      offset,
    });

    const formattedRatings = rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      createdAt: r.created_at,
      user: {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        address: r.user.address,
      },
    }));

    return {
      store: {
        id: activeStore.id,
        name: activeStore.name,
      },
      stores: stores.map((s) => ({ id: s.id, name: s.name })),
      ratings: formattedRatings,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum) || 1,
      },
    };
  }
}

module.exports = new OwnerService();
