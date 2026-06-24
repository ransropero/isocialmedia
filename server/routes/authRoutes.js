const express = require('express');
const router = express.Router();
const { register, login, getUsers, updateUserAccess, updateUserPlan, socialLoginSuccess, deleteAccount } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const passport = require('passport');

router.post('/register', register);
router.post('/login', login);

// Middleware to check if social auth is enabled
const checkGoogleAuth = (req, res, next) => {
    if (process.env.ENABLE_GOOGLE_AUTH !== 'true') {
        return res.status(403).json({ message: 'Login com Google está desativado no momento.' });
    }
    next();
};

const checkFacebookAuth = (req, res, next) => {
    if (process.env.ENABLE_FACEBOOK_AUTH !== 'true') {
        return res.status(403).json({ message: 'Login com Facebook está desativado no momento.' });
    }
    next();
};

// Google OAuth
router.get('/google', checkGoogleAuth, passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', checkGoogleAuth, passport.authenticate('google', { session: false }), socialLoginSuccess);

// Facebook OAuth
router.get('/facebook', checkFacebookAuth, passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', checkFacebookAuth, passport.authenticate('facebook', { session: false }), socialLoginSuccess);

// Auth Routes
router.get('/me', authMiddleware, (req, res) => {
    res.json({
        id: req.user.id,
        email: req.user.email,
        isAdmin: req.user.isAdmin,
        plan: req.user.plan,
        hasAccess: req.user.hasAccess
    });
});

router.delete('/delete-account', authMiddleware, deleteAccount);

// Admin Routes
router.get('/users', authMiddleware, adminMiddleware, getUsers);
router.put('/users/:id/access', authMiddleware, adminMiddleware, updateUserAccess);
router.put('/users/:id/plan', authMiddleware, adminMiddleware, updateUserPlan);

module.exports = router;
