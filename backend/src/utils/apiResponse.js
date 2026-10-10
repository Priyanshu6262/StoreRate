class ApiResponse {
  constructor(statusCode, message, data = null, meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null) this.data = data;
    if (meta !== null) this.meta = meta;
  }

  static success(res, statusCode = 200, message = 'Success', data = null, meta = null) {
    return res.status(statusCode).json(new ApiResponse(statusCode, message, data, meta));
  }
}

module.exports = ApiResponse;
