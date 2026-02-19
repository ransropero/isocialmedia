const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

try {
    sequelize = process.env.DATABASE_URL
        ? new Sequelize(process.env.DATABASE_URL, {
            dialect: 'postgres',
            logging: false,
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false,
                },
            },
        })
        : new Sequelize({
            dialect: 'sqlite',
            storage: path.join(__dirname, '..', 'database.sqlite'),
            logging: false,
        });
} catch (configError) {
    console.error('CRITICAL: Failed to initialize Sequelize:', configError.message);
    // Mock Sequelize object to prevent crash on require
    sequelize = {
        authenticate: async () => { throw new Error('Sequelize failed to initialize'); },
        sync: async () => { console.warn('Skipping sync: Sequelize failed to initialize'); },
        define: () => ({ /* Mock model */ }),
        isMock: true
    };
}

// Encoded URL Logger for Debugging
if (process.env.DATABASE_URL) {
    try {
        const url = new URL(process.env.DATABASE_URL);
        console.log(`[DB Config] Parsed URL -> Host: ${url.hostname}, User: ${url.username}, Path: ${url.pathname}, Protocol: ${url.protocol}`);
    } catch (e) {
        console.error('[DB Config] Failed to parse DATABASE_URL:', e.message);
    }
}

// Test connection
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error.message);
    }
})();

module.exports = sequelize;
