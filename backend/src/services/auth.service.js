const bcrypt = require('bcryptjs');
const { User, Store } = require('../models');
const ApiError = require('../utils/apiError');
const { signToken } = require('../utils/jwt');

class AuthService {
  async register({ name, email, address, password }) {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      address,
      password_hash,
      role: 'USER',
    });

    const token = signToken({ id: user.id, role: user.role });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.created_at,
    };

    return { user: safeUser, token };
  }

  async login({ email, password }) {
    const normalizedEmail = (email || '').toLowerCase().trim();
    const user = await User.findOne({
      where: { email: normalizedEmail },
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'email', 'address'],
        },
      ],
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = signToken({ id: user.id, role: user.role });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      store: user.store || null,
      createdAt: user.created_at,
    };

    return { user: safeUser, token };
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    user.password_hash = password_hash;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async getMe(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'address', 'role', 'created_at'],
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'email', 'address'],
        },
      ],
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }
}

module.exports = new AuthService();
