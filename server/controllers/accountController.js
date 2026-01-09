const Account = require('../models/Account');
const { encrypt } = require('../utils/encryption');
const { IgApiClient } = require('instagram-private-api');

exports.createAccount = async (req, res) => {
    try {
        const { name, username, password } = req.body;

        if (!name || !username || !password) {
            return res.status(400).json({ error: 'Name, Username, and Password are required' });
        }

        // Verify credentials by attempting to login
        const ig = new IgApiClient();
        ig.state.generateDevice(username);

        try {
            console.log(`Verifying login for ${username}...`);
            // We simulate a login to check credentials
            // Note: This might trigger a challenge (checkpoint) in a real scenario
            await ig.simulate.preLoginFlow();
            const loggedInUser = await ig.account.login(username, password);
            console.log('Login successful:', loggedInUser.username);

            // Get profile picture
            const info = await ig.user.info(loggedInUser.pk);
            const profilePictureUrl = info.profile_pic_url;

            const account = await Account.create({
                name,
                username,
                password: encrypt(password), // Store encrypted
                profilePictureUrl,
                userId: req.user.id
            });

            res.status(201).json({
                id: account.id,
                name: account.name,
                username: account.username,
                profilePictureUrl: account.profilePictureUrl
            });

        } catch (igError) {
            console.error('Instagram Login Error:', igError);
            let errorMessage = 'Failed to verify Instagram credentials.';
            if (igError.message.includes('password')) errorMessage = 'Invalid password.';
            if (igError.message.includes('challenge')) errorMessage = 'Account challenge required. Please log in via the app and confirm activity.';

            return res.status(400).json({ error: errorMessage });
        }

    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Account already exists' });
        }
        console.error('Error creating account:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getAccounts = async (req, res) => {
    try {
        let where = {};
        if (!req.user.isAdmin) {
            where = { userId: req.user.id };
        }
        const accounts = await Account.findAll({ where });
        res.json(accounts);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const account = await Account.findByPk(id);

        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        if (account.userId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Not authorized to delete this account' });
        }

        await account.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
