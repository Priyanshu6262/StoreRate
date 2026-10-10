const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { User, Store, Rating, sequelize } = require('../models');
const ApiError = require('../utils/apiError');

class AdminService {
  async getDashboardStats() {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.count(),
      Store.count(),
      Rating.count(),
    ]);

    return {
      totalUsers,
      totalStores,
      totalRatings,
    };
  }

  async getUsers({ page = 1, limit = 10, search = '', role = '', sortBy = 'created_at', sortOrder = 'DESC' }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const allowedSortFields = {
      name: 'name',
      email: 'email',
      address: 'address',
      role: 'role',
      created_at: 'created_at',
      createdAt: 'created_at',
    };

    const sortColumn = allowedSortFields[sortBy] || 'created_at';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const whereConditions = [];

    if (role && ['ADMIN', 'USER', 'STORE_OWNER'].includes(role.toUpperCase())) {
      whereConditions.push({ role: role.toUpperCase() });
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      whereConditions.push({
        [Op.or]: [
          { name: { [Op.like]: term } },
          { email: { [Op.like]: term } },
          { address: { [Op.like]: term } },
        ],
      });
    }

    const where = whereConditions.length > 0 ? { [Op.and]: whereConditions } : {};

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ['id', 'name', 'email', 'address', 'role', 'created_at', 'updated_at'],
      order: [[sortColumn, direction]],
      limit: limitNum,
      offset,
    });

    return {
      users: rows,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum) || 1,
      },
    };
  }

  async createUser({ name, email, password, address, role }) {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password_hash,
      address: address || null,
      role: role.toUpperCase(),
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.created_at,
    };
  }

  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'address', 'role', 'created_at'],
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'email', 'address', 'created_at'],
        },
      ],
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const userData = user.toJSON();

    if (userData.role === 'STORE_OWNER' && userData.store) {
      // Calculate store average rating and total ratings
      const [ratingStats] = await Rating.findAll({
        where: { store_id: userData.store.id },
        attributes: [
          [sequelize.fn('COALESCE', sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('rating')), 1), 0), 'average_rating'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_ratings'],
        ],
        raw: true,
      });

      userData.store.average_rating = ratingStats ? parseFloat(ratingStats.average_rating) || 0 : 0;
      userData.store.total_ratings = ratingStats ? parseInt(ratingStats.total_ratings, 10) || 0 : 0;
    }

    return userData;
  }

  async getStores({ page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC' }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const allowedSortFields = {
      name: 'name',
      email: 'email',
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
          { email: { [Op.like]: term } },
          { address: { [Op.like]: term } },
        ],
      });
    }

    const where = whereConditions.length > 0 ? { [Op.and]: whereConditions } : {};

    const orderClause =
      targetSort === 'average_rating'
        ? [[sequelize.literal('average_rating'), direction]]
        : [[targetSort, direction]];

    const { count, rows } = await Store.findAndCountAll({
      where,
      attributes: [
        'id',
        'name',
        'email',
        'address',
        'owner_id',
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
      ],
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
      ],
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

  async createStore({ name, email, address, owner_id }) {
    const owner = await User.findByPk(owner_id);
    if (!owner) {
      throw ApiError.notFound('Store owner not found');
    }
    if (owner.role !== 'STORE_OWNER') {
      throw ApiError.badRequest('Assigned user must have STORE_OWNER role');
    }

    const existingStore = await Store.findOne({ where: { owner_id } });
    if (existingStore) {
      throw ApiError.conflict('This owner already has an assigned store');
    }

    const store = await Store.create({
      name,
      email,
      address,
      owner_id,
    });

    return store;
  }
}

module.exports = new AdminService();
