const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return ApiResponse.success(res, 201, 'User registered successfully', result);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return ApiResponse.success(res, 200, 'Logged in successfully', result);
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      const result = await authService.changePassword(req.user.id, req.body);
      return ApiResponse.success(res, 200, result.message, null);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);
      return ApiResponse.success(res, 200, 'User profile retrieved', user);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
