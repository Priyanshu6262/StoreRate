const ApiError = require('../utils/apiError');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'field';
    const message = field.includes('email')
      ? 'Email is already registered'
      : `${field} must be unique. Already exists in database.`;
    error = ApiError.conflict(message);
  }

  // Handle Sequelize Validation Error
  else if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    error = ApiError.badRequest(messages[0] || 'Database validation error', messages);
  }

  // Handle JWT Error
  else if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid authentication token');
  } else if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Authentication token has expired');
  }

  // If not an instance of ApiError, create a generic Internal error
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message);
  }

  // Production-safe JSON response without leaking stack trace
  res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || [],
  });
};

module.exports = errorHandler;
