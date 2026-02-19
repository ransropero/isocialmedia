require('dotenv').config();
const sequelize = require('./config/db');
const { db, admin } = require('./config/firebase');

// Import Sequelize models
const User = require('./models/User');
const Account = require('./models/Account');
const Post = require('./models/Post');
const BioPage = require('./models/BioPage');
const BioClick = require('./models/BioClick');

const migrateAll = async () => {
    try {
        console.log('--- Starting Data Migration to Firestore ---');

        await sequelize.authenticate();
        console.log(`Connected to SQL database using dialect: ${sequelize.getDialect()}`);

        if (sequelize.getDialect() === 'sqlite') {
            console.warn('WARNING: Running migration against local SQLite database. If you want to migrate from Supabase, ensure DATABASE_URL is set in server/.env');
        } else {
            console.log('Successfully targeting Supabase (PostgreSQL) for migration.');
        }

        const safeStr = (val) => val ? val.toString() : null;
        const safeDate = (val) => val ? admin.firestore.Timestamp.fromDate(new Date(val)) : admin.firestore.Timestamp.now();

        // 1. Migrate Users
        try {
            console.log('Migrating Users...');
            let users;
            try {
                users = await User.findAll();
            } catch (e) {
                console.warn('Warning: Missing columns in Users table, falling back to safe selection...');
                users = await User.findAll({
                    attributes: ['id', 'email', 'password', 'hasAccess', 'isAdmin', 'createdAt']
                });
            }

            for (const user of users) {
                if (!user.id) continue;
                await db.collection('users').doc(user.id.toString()).set({
                    email: user.email,
                    password: user.password,
                    hasAccess: !!user.hasAccess,
                    isAdmin: !!user.isAdmin,
                    plan: user.plan || 'trial',
                    createdAt: safeDate(user.createdAt)
                });
            }
            console.log(`Migrated ${users.length} users.`);

            // Metadata initialization
            await db.collection('metadata').doc('stats').set({
                userCount: users.length
            }, { merge: true });

        } catch (err) {
            console.warn('Skipping Users migration:', err.message);
        }

        // 2. Migrate Accounts
        try {
            console.log('Migrating Accounts...');
            const accounts = await Account.findAll();
            for (const account of accounts) {
                if (!account.id) continue;
                await db.collection('accounts').doc(account.id.toString()).set({
                    name: account.name || 'Sem nome',
                    username: account.username || 'unknown',
                    password: account.password || '',
                    profilePictureUrl: account.profilePictureUrl || null,
                    userId: safeStr(account.userId),
                    createdAt: safeDate(account.createdAt)
                });
            }
            console.log(`Migrated ${accounts.length} accounts.`);
        } catch (err) {
            console.warn('Skipping Accounts migration (table might not exist):', err.message);
        }

        // 3. Migrate Posts
        try {
            console.log('Migrating Posts...');
            const posts = await Post.findAll();
            for (const post of posts) {
                if (!post.id) continue;
                await db.collection('posts').doc(post.id.toString()).set({
                    caption: post.caption || '',
                    imageUrl: post.imageUrl || '',
                    scheduledTime: safeDate(post.scheduledTime),
                    status: post.status || 'FAILED',
                    instagramId: post.instagramId || null,
                    accountId: safeStr(post.accountId),
                    userId: safeStr(post.userId),
                    type: post.type || 'FEED',
                    recurrenceGroupId: post.recurrenceGroupId || null,
                    recurrenceInterval: post.recurrenceInterval || null,
                    recurrenceTotal: post.recurrenceTotal || null,
                    recurrenceCurrent: post.recurrenceCurrent || 1,
                    createdAt: safeDate(post.createdAt)
                });
            }
            console.log(`Migrated ${posts.length} posts.`);
        } catch (err) {
            console.warn('Skipping Posts migration (table might not exist):', err.message);
        }

        // 4. Migrate Bio Pages
        try {
            console.log('Migrating Bio Pages...');
            let bioPages;
            try {
                bioPages = await BioPage.findAll();
            } catch (e) {
                console.warn('Warning: Missing columns in BioPages table, falling back to safe selection...');
                bioPages = await BioPage.findAll({
                    attributes: [
                        'id', 'slug', 'title', 'description', 'backgroundColor',
                        'textColor', 'buttonColor', 'fontFamily', 'links',
                        'profileImageUrl', 'backgroundImageUrl', 'userId', 'createdAt'
                    ]
                });
            }

            for (const page of bioPages) {
                if (!page.id) continue;
                await db.collection('bio_pages').doc(page.id.toString()).set({
                    slug: page.slug || page.id.toString(),
                    title: page.title || '',
                    description: page.description || '',
                    backgroundColor: page.backgroundColor || '#ffffff',
                    textColor: page.textColor || '#000000',
                    buttonColor: page.buttonColor || '#000000',
                    fontFamily: page.fontFamily || 'Inter',
                    profileImageUrl: page.profileImageUrl || null,
                    backgroundImageUrl: page.backgroundImageUrl || null,
                    showLogo: page.showLogo !== undefined ? !!page.showLogo : true,
                    links: page.links || [],
                    userId: safeStr(page.userId),
                    createdAt: safeDate(page.createdAt)
                });
            }
            console.log(`Migrated ${bioPages.length} bio pages.`);
        } catch (err) {
            console.warn('Skipping Bio Pages migration (table might not exist):', err.message);
        }

        // 5. Migrate Bio Clicks
        try {
            console.log('Migrating Bio Clicks...');
            const clicks = await BioClick.findAll();
            const batchSize = 400;
            for (let i = 0; i < clicks.length; i += batchSize) {
                const batch = db.batch();
                const chunk = clicks.slice(i, i + batchSize);
                chunk.forEach(click => {
                    const ref = db.collection('bio_clicks').doc();
                    batch.set(ref, {
                        bioPageId: safeStr(click.bioPageId),
                        linkIndex: click.linkIndex || 0,
                        timestamp: safeDate(click.timestamp)
                    });
                });
                await batch.commit();
            }
            console.log(`Migrated ${clicks.length} analytics records.`);
        } catch (err) {
            console.warn('Skipping Bio Clicks migration (table might not exist):', err.message);
        }

        console.log('--- Migration Completed (with warnings for missing tables) ---');
        process.exit(0);
    } catch (error) {
        console.error('CRITICAL MIGRATION ERROR:', error);
        process.exit(1);
    }
};

migrateAll();
