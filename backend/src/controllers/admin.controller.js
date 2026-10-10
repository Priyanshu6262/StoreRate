const adminService = require('../services/admin.service');
const ApiResponse = require('../utils/apiResponse');

class AdminController {
  async getDashboardStats(req, res, next) {
    try {
      const stats = await adminService.getDashboardStats();
      return ApiResponse.success(res, 200, 'Dashboard statistics retrieved', stats);
    } catch (err) {
      next(err);
    }
  }

  async getUsers(req, res, next) {
    try {
      const result = await adminService.getUsers(req.query);
      return ApiResponse.success(res, 200, 'Users retrieved successfully', result.users, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async createUser(req, res, next) {
    try {
      const user = await adminService.createUser(req.body);
      return ApiResponse.success(res, 201, 'User created successfully', user);
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await adminService.getUserById(req.params.id);
      return ApiResponse.success(res, 200, 'User details retrieved', user);
    } catch (err) {
      next(err);
    }
  }

  async getStores(req, res, next) {
    try {
      const result = await adminService.getStores(req.query);
      return ApiResponse.success(res, 200, 'Stores retrieved successfully', result.stores, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async createStore(req, res, next) {
    try {
      const store = await adminService.createStore(req.body);
      return ApiResponse.success(res, 201, 'Store created successfully', store);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
