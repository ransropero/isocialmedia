const express = require('express');
const router = express.Router();
const { register, login, getUsers, updateUserAccess, updateUserPlan } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/register', register);
router.post('/login', login);

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

// Admin Routes
router.get('/users', authMiddleware, adminMiddleware, getUsers);
router.put('/users/:id/access', authMiddleware, adminMiddleware, updateUserAccess);
router.put('/users/:id/plan', authMiddleware, adminMiddleware, updateUserPlan);

module.exports = router;
