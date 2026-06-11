const { db } = require('../config/firebase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d'
    });
};

exports.register = async (req, res) => {
    const { email, password, fullName, birthDate, cpf, optIn } = req.body;

    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).get();

        if (!snapshot.empty) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const userCountSnapshot = await db.collection('metadata').doc('stats').get();
        const isFirstUser = !userCountSnapshot.exists || (userCountSnapshot.data().userCount || 0) === 0;

        const hashedPassword = await bcrypt.hash(password, 10);

        const userDoc = await usersRef.add({
            email,
            password: hashedPassword,
            fullName: fullName || '',
            birthDate: birthDate || null,
            cpf: cpf || '',
            optIn: !!optIn,
            hasAccess: true, // Automatically grant access
            isAdmin: isFirstUser,
            plan: 'start', // Default plan is now 'start'
            createdAt: new Date()
        });

        // Increment user count
        await db.collection('metadata').doc('stats').set({
            userCount: (userCountSnapshot.exists ? userCountSnapshot.data().userCount || 0 : 0) + 1
        }, { merge: true });

        res.status(201).json({
            id: userDoc.id,
            email,
            token: generateToken(userDoc.id)
        });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({
            message: 'Server error during registration',
            error: error.message
        });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).get();

        if (snapshot.empty) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        const isPasswordValid = await bcrypt.compare(password, userData.password);

        if (isPasswordValid) {
            if (!userData.hasAccess) {
                return res.status(403).json({
                    message: 'Access Denied. Your account is pending approval.'
                });
            }

            res.json({
                id: userDoc.id,
                email: userData.email,
                isAdmin: userData.isAdmin,
                plan: userData.plan,
                token: generateToken(userDoc.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            message: 'Server error during login',
            error: error.message
        });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                email: data.email,
                hasAccess: data.hasAccess,
                isAdmin: data.isAdmin,
                plan: data.plan,
                createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt) : null
            };
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUserAccess = async (req, res) => {
    try {
        const { id } = req.params;
        const { hasAccess } = req.body;

        if (id === req.user.id) {
            return res.status(400).json({ message: 'Cannot modify your own access' });
        }

        await db.collection('users').doc(id).update({ hasAccess });

        res.json({ message: `User access ${hasAccess ? 'granted' : 'revoked'}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUserPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { plan } = req.body;

        if (!['start', 'growth', 'pro'].includes(plan)) {
            return res.status(400).json({ message: 'Invalid plan type' });
        }

        await db.collection('users').doc(id).update({ plan });

        res.json({ message: `User plan updated to ${plan}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.socialLoginSuccess = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication failed' });
    }

    const token = generateToken(req.user.id);
    const user = {
        id: req.user.id,
        email: req.user.email,
        isAdmin: req.user.isAdmin
    };

    // Redirect to frontend with token and user data
    // In production, you'd want to use a more secure way to pass the token, 
    // but for this implementation we'll use query params that the client will capture and clear.
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
};


