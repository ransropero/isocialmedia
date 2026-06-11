const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const sequelize = require('../config/db');
const Post = require('../models/Post');
const Account = require('../models/Account');
const BioPage = require('../models/BioPage');

const inspectUrls = async () => {
    try {
        await sequelize.authenticate();
        console.log('--- Inspecting Image URLs in Database ---');

        const posts = await Post.findAll();
        const postUrls = posts.map(p => p.imageUrl).filter(Boolean);
        console.log(`Found ${postUrls.length} post URLs.`);
        const postDomains = [...new Set(postUrls.map(url => {
            try { return new URL(url).hostname; } catch(e) { return 'invalid'; }
        }))];
        console.log('Post Domains:', postDomains);

        const accounts = await Account.findAll();
        const accountUrls = accounts.map(a => a.profilePictureUrl).filter(Boolean);
        console.log(`Found ${accountUrls.length} account profile URLs.`);
        const accountDomains = [...new Set(accountUrls.map(url => {
            try { return new URL(url).hostname; } catch(e) { return 'invalid'; }
        }))];
        console.log('Account Domains:', accountDomains);

        const bioPages = await BioPage.findAll();
        const bioUrls = bioPages.flatMap(b => [b.profileImageUrl, b.backgroundImageUrl]).filter(Boolean);
        console.log(`Found ${bioUrls.length} bio page image URLs.`);
        const bioDomains = [...new Set(bioUrls.map(url => {
            try { return new URL(url).hostname; } catch(e) { return 'invalid'; }
        }))];
        console.log('Bio Domains:', bioDomains);

        process.exit(0);
    } catch (error) {
        console.error('Inspection Error:', error);
        process.exit(1);
    }
};

inspectUrls();
