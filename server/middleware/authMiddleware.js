const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

const authMiddleware = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const userDoc = await db.collection('users').doc(decoded.id).get();

        if (!userDoc.exists) {
            return res.status(401).json({ message: 'User not found' });
        }

        const user = userDoc.data();
        if (!user.hasAccess) {
            return res.status(403).json({ message: 'Access denied' });
        }

        req.user = { id: userDoc.id, ...user };
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

module.exports = authMiddleware;

