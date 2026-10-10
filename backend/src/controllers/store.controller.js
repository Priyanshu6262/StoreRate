const storeService = require('../services/store.service');
const ratingService = require('../services/rating.service');
const ApiResponse = require('../utils/apiResponse');

class StoreController {
  async getStores(req, res, next) {
    try {
      const currentUserId = req.user ? req.user.id : null;
      const result = await storeService.getStores({
        ...req.query,
        currentUserId,
      });
      return ApiResponse.success(res, 200, 'Stores retrieved successfully', result.stores, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async getStoreById(req, res, next) {
    try {
      const currentUserId = req.user ? req.user.id : null;
      const store = await storeService.getStoreById(req.params.id, currentUserId);
      return ApiResponse.success(res, 200, 'Store retrieved successfully', store);
    } catch (err) {
      next(err);
    }
  }

  async submitRating(req, res, next) {
    try {
      const { rating } = req.body;
      const result = await ratingService.submitOrUpdateRating({
        userId: req.user.id,
        storeId: req.params.id,
        rating,
      });

      const message = result.isNew ? 'Rating submitted successfully' : 'Rating updated successfully';
      const statusCode = result.isNew ? 201 : 200;

      return ApiResponse.success(res, statusCode, message, result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StoreController();
