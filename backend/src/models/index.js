const sequelize = require('../config/database');
const User = require('./user.model');
const Store = require('./store.model');
const Rating = require('./rating.model');

// User <-> Store
User.hasOne(Store, {
  foreignKey: 'owner_id',
  as: 'store',
  onDelete: 'CASCADE',
});
User.hasMany(Store, {
  foreignKey: 'owner_id',
  as: 'stores',
  onDelete: 'CASCADE',
});
Store.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner',
});

// User <-> Rating
User.hasMany(Rating, {
  foreignKey: 'user_id',
  as: 'ratings',
  onDelete: 'CASCADE',
});
Rating.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Store <-> Rating
Store.hasMany(Rating, {
  foreignKey: 'store_id',
  as: 'ratings',
  onDelete: 'CASCADE',
});
Rating.belongsTo(Store, {
  foreignKey: 'store_id',
  as: 'store',
});

module.exports = {
  sequelize,
  User,
  Store,
  Rating,
};
