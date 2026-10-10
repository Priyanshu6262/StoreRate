const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/apiError');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('Authentication token is required'));
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtErr) {
      return next(ApiError.unauthorized('Invalid or expired token'));
    }

    // Always fetch latest user from database (never trust token payload blindly)
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'address', 'role', 'created_at', 'updated_at'],
    });

    if (!user) {
      return next(ApiError.unauthorized('User not found or account deactivated'));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authenticate;
