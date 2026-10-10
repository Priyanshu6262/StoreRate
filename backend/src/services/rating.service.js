const { Rating, Store, sequelize } = require('../models');
const ApiError = require('../utils/apiError');

class RatingService {
  async submitOrUpdateRating({ userId, storeId, rating }) {
    const store = await Store.findByPk(storeId);
    if (!store) {
      throw ApiError.notFound('Store not found');
    }

    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      throw ApiError.badRequest('Rating must be an integer between 1 and 5');
    }

    // Check if rating exists
    let ratingRecord = await Rating.findOne({
      where: {
        user_id: userId,
        store_id: storeId,
      },
    });

    let isNew = false;
    if (ratingRecord) {
      ratingRecord.rating = numericRating;
      await ratingRecord.save();
    } else {
      isNew = true;
      ratingRecord = await Rating.create({
        user_id: userId,
        store_id: storeId,
        rating: numericRating,
      });
    }

    // Get updated store stats
    const [stats] = await Rating.findAll({
      where: { store_id: storeId },
      attributes: [
        [sequelize.fn('COALESCE', sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('rating')), 1), 0), 'average_rating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_ratings'],
      ],
      raw: true,
    });

    return {
      rating: ratingRecord,
      isNew,
      averageRating: stats ? parseFloat(stats.average_rating) || 0 : 0,
      totalRatings: stats ? parseInt(stats.total_ratings, 10) || 0 : 0,
    };
  }
}

module.exports = new RatingService();
