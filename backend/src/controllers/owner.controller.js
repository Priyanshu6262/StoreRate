const ownerService = require('../services/owner.service');
const ApiResponse = require('../utils/apiResponse');

class OwnerController {
  async getDashboard(req, res, next) {
    try {
      const { storeId } = req.query;
      const data = await ownerService.getOwnerDashboard(req.user.id, storeId);
      return ApiResponse.success(res, 200, 'Owner dashboard retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  async getRatings(req, res, next) {
    try {
      const result = await ownerService.getOwnerRatings(req.user.id, req.query);
      return ApiResponse.success(res, 200, 'Store ratings retrieved', result.ratings, {
        ...result.pagination,
        store: result.store,
        stores: result.stores,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OwnerController();
