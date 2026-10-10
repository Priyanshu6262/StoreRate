const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const { sequelize, User, Store, Rating } = require('../models');

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MySQL and synchronizing tables...');
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // Fresh clean start for seeding
    console.log('✅ Database tables synchronized.');

    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('Admin@1234', salt);
    const ownerHash = await bcrypt.hash('Owner@1234', salt);
    const userHash = await bcrypt.hash('User@1234', salt);

    console.log('🌱 Seeding Users...');
    // 1 Admin, 2 Store Owners, 5 Normal Users
    const usersData = [
      {
        name: 'System Administrator Roxiler', // 29 chars
        email: 'admin@storerate.com',
        password_hash: adminHash,
        address: 'Roxiler Systems HQ, Cyber City Phase 2, Gurugram, India',
        role: 'ADMIN',
      },
      {
        name: 'Robert Johnson Store Owner', // 26 chars
        email: 'owner1@storerate.com',
        password_hash: ownerHash,
        address: '456 Market Street, Commercial Arcade, Mumbai, Maharashtra',
        role: 'STORE_OWNER',
      },
      {
        name: 'Sophia Martinez Retailer', // 24 chars
        email: 'owner2@storerate.com',
        password_hash: ownerHash,
        address: '789 High Street Shopping Center, Bengaluru, Karnataka',
        role: 'STORE_OWNER',
      },
      {
        name: 'Alice Henderson Shopper', // 23 chars
        email: 'user1@storerate.com',
        password_hash: userHash,
        address: '12 Green Valley Residency, Sector 62, Noida, Uttar Pradesh',
        role: 'USER',
      },
      {
        name: 'Benjamin Franklin Customer', // 26 chars
        email: 'user2@storerate.com',
        password_hash: userHash,
        address: '88 Orchid Avenue, Jubilee Hills, Hyderabad, Telangana',
        role: 'USER',
      },
      {
        name: 'Catherine Zeta Valued Client', // 28 chars
        email: 'user3@storerate.com',
        password_hash: userHash,
        address: '102 Pine Crest Boulevard, Salt Lake, Kolkata, West Bengal',
        role: 'USER',
      },
      {
        name: 'David Beckham Loyal Member', // 26 chars
        email: 'user4@storerate.com',
        password_hash: userHash,
        address: '55 Sunrise Apartments, Viman Nagar, Pune, Maharashtra',
        role: 'USER',
      },
      {
        name: 'Eleanor Roosevelt Patron', // 24 chars
        email: 'user5@storerate.com',
        password_hash: userHash,
        address: '33 Heritage Square, Civil Lines, Jaipur, Rajasthan',
        role: 'USER',
      },
    ];

    const users = await User.bulkCreate(usersData);
    console.log(`✅ Created ${users.length} users.`);

    const owner1 = users.find((u) => u.email === 'owner1@storerate.com');
    const owner2 = users.find((u) => u.email === 'owner2@storerate.com');

    console.log('🌱 Seeding Stores...');
    // 5 Stores
    const storesData = [
      {
        name: 'Urban Trend Fashion Store',
        email: 'urban@trendfashion.com',
        address: 'Block A-102, Phoenix Marketcity, Kurla West, Mumbai',
        owner_id: owner1.id,
      },
      {
        name: 'Apex Electronics Hub Ltd',
        email: 'support@apexelectronics.com',
        address: 'Plot 42, Electronics City Phase 1, Hosur Road, Bengaluru',
        owner_id: owner2.id,
      },
      {
        name: 'Green Organics Fresh Market',
        email: 'hello@greenorganics.com',
        address: 'SCO 14-15, Sector 35-B, Inner Market, Chandigarh',
        owner_id: owner1.id,
      },
      {
        name: 'Nexus Gourmet Coffee House',
        email: 'brew@nexuscoffee.com',
        address: 'Ground Floor, Cyber Gateway, HITEC City, Hyderabad',
        owner_id: owner2.id,
      },
      {
        name: 'Peak Performance Sports Gear',
        email: 'info@peaksports.com',
        address: 'Shop 204, DLF Mall of India, Sector 18, Noida',
        owner_id: owner1.id,
      },
    ];

    const stores = await Store.bulkCreate(storesData);
    console.log(`✅ Created ${stores.length} stores.`);

    const normalUsers = users.filter((u) => u.role === 'USER');

    console.log('🌱 Seeding Sample Ratings...');
    const ratingsData = [
      // Store 1 ratings
      { user_id: normalUsers[0].id, store_id: stores[0].id, rating: 5 },
      { user_id: normalUsers[1].id, store_id: stores[0].id, rating: 4 },
      { user_id: normalUsers[2].id, store_id: stores[0].id, rating: 5 },
      { user_id: normalUsers[4].id, store_id: stores[0].id, rating: 4 },

      // Store 2 ratings
      { user_id: normalUsers[0].id, store_id: stores[1].id, rating: 4 },
      { user_id: normalUsers[1].id, store_id: stores[1].id, rating: 5 },
      { user_id: normalUsers[3].id, store_id: stores[1].id, rating: 4 },

      // Store 3 ratings
      { user_id: normalUsers[0].id, store_id: stores[2].id, rating: 5 },
      { user_id: normalUsers[2].id, store_id: stores[2].id, rating: 4 },
      { user_id: normalUsers[4].id, store_id: stores[2].id, rating: 5 },

      // Store 4 ratings
      { user_id: normalUsers[1].id, store_id: stores[3].id, rating: 3 },
      { user_id: normalUsers[3].id, store_id: stores[3].id, rating: 5 },
      { user_id: normalUsers[4].id, store_id: stores[3].id, rating: 4 },

      // Store 5 ratings
      { user_id: normalUsers[2].id, store_id: stores[4].id, rating: 4 },
      { user_id: normalUsers[3].id, store_id: stores[4].id, rating: 3 },
    ];

    const ratings = await Rating.bulkCreate(ratingsData);
    console.log(`✅ Created ${ratings.length} ratings.`);

    console.log('\n=============================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=============================================');
    console.log('Demo Credentials:');
    console.log('1. Admin: admin@storerate.com / Admin@1234');
    console.log('2. Store Owner 1: owner1@storerate.com / Owner@1234');
    console.log('3. Store Owner 2: owner2@storerate.com / Owner@1234');
    console.log('4. Normal User: user1@storerate.com / User@1234');
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedDatabase();
