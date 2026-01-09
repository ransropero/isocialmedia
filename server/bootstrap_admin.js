const User = require('./models/User');
const sequelize = require('./config/db');

async function bootstrapAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // This will update the table schema to include new columns
        await sequelize.sync({ alter: true });
        console.log('Database synced (altered).');

        const adminEmail = 'admin@example.com';
        const adminPassword = 'adminpassword123';

        let user = await User.findOne({ where: { email: adminEmail } });

        if (!user) {
            console.log('Creating Admin User...');
            user = await User.create({
                email: adminEmail,
                password: adminPassword,
                hasAccess: true,
                isAdmin: true
            });
            console.log(`Admin user created: ${adminEmail} / ${adminPassword}`);
        } else {
            console.log('Admin user exists. Updating privileges...');
            user.hasAccess = true;
            user.isAdmin = true;
            await user.save();
            console.log(`Admin privileges updated for: ${adminEmail}`);
        }

    } catch (error) {
        console.error('Bootstrap failed:', error);
    } finally {
        await sequelize.close();
    }
}

bootstrapAdmin();
