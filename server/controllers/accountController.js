const { db } = require('../config/firebase');
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
            await ig.simulate.preLoginFlow();
            const loggedInUser = await ig.account.login(username, password);
            console.log('Login successful:', loggedInUser.username);

            // Get profile picture
            const info = await ig.user.info(loggedInUser.pk);
            const profilePictureUrl = info.profile_pic_url;

            // Check if account already exists in Firestore
            const accountsRef = db.collection('accounts');
            const snapshot = await accountsRef.where('username', '==', username).get();
            if (!snapshot.empty) {
                return res.status(400).json({ error: 'Account already exists' });
            }

            const accountDoc = await accountsRef.add({
                name,
                username,
                password: encrypt(password), // Store encrypted
                profilePictureUrl,
                userId: req.user.id,
                createdAt: new Date()
            });

            res.status(201).json({
                id: accountDoc.id,
                name,
                username,
                profilePictureUrl
            });

        } catch (igError) {
            console.error('Instagram Login Error Detail:', igError.message);

            let errorMessage = 'Failed to verify Instagram credentials.';
            const message = igError.message.toLowerCase();

            if (message.includes('password') || igError.name === 'IgLoginBadPasswordError') {
                errorMessage = 'Invalid password or login flagged by Instagram.';
            } else if (message.includes('challenge') || igError.name === 'IgCheckpointError') {
                errorMessage = 'Account challenge required. Please log in via the app.';
            } else if (message.includes('two-factor') || igError.name === 'IgLoginTwoFactorRequiredError') {
                errorMessage = 'Two-factor authentication is enabled.';
            }

            return res.status(400).json({ error: errorMessage });
        }

    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getAccounts = async (req, res) => {
    try {
        let query = db.collection('accounts');
        if (!req.user.isAdmin) {
            query = query.where('userId', '==', req.user.id);
        }

        const snapshot = await query.get();
        const accounts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(accounts);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const accountDoc = await db.collection('accounts').doc(id).get();

        if (!accountDoc.exists) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const accountData = accountDoc.data();
        if (accountData.userId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await db.collection('accounts').doc(id).delete();
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

