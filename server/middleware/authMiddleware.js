const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

const userCache = new Map();
const USER_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

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
        
        const now = Date.now();
        const cachedUser = userCache.get(decoded.id);
        let user;

        if (cachedUser && (now - cachedUser.timestamp < USER_CACHE_TTL)) {
            user = cachedUser.data;
        } else {
            const userDoc = await db.collection('users').doc(decoded.id).get();
            if (!userDoc.exists) {
                return res.status(401).json({ message: 'User not found' });
            }
            user = { id: userDoc.id, ...userDoc.data() };
            userCache.set(decoded.id, { data: user, timestamp: now });
        }

        if (!user.hasAccess) {
            return res.status(403).json({ message: 'Access denied' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

module.exports = authMiddleware;

