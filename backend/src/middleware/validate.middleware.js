const ApiError = require('../utils/apiError');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = schema.parse(dataToValidate);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return next(
          new ApiError(400, formattedErrors[0]?.message || 'Validation failed', formattedErrors)
        );
      }
      next(err);
    }
  };
};

module.exports = validate;
