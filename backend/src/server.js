const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database connected successfully.');

    // Sync database tables
    await sequelize.sync({ alter: true });
    console.log('✅ Sequelize models synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 StoreRate Backend server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MySQL database:', err.message);
    process.exit(1);
  }
}

startServer();
