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
            console.error('Instagram Login Error Detail:', {
                name: igError.name,
                message: igError.message,
                stack: igError.stack
            });

            let errorMessage = 'Failed to verify Instagram credentials.';
            const message = igError.message.toLowerCase();

            if (message.includes('password') || igError.name === 'IgLoginBadPasswordError') {
                errorMessage = 'Invalid password or login flagged by Instagram. Try resetting your password or checking your email for a login alert.';
            } else if (message.includes('challenge') || igError.name === 'IgCheckpointError') {
                errorMessage = 'Account challenge required. Please log in via the app and confirm "It was me" in the security notifications.';
            } else if (message.includes('two-factor') || igError.name === 'IgLoginTwoFactorRequiredError') {
                errorMessage = 'Two-factor authentication is enabled. Please disable it temporarily to link the account.';
            } else if (message.includes('rate limit') || message.includes('spam')) {
                errorMessage = 'Instagram has rate-limited this request. Please try again later.';
            } else if (message.includes('email to help you get back')) {
                errorMessage = 'Instagram suggests sending an email to recover your account. Please log in to the official app first.';
            }

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
