const express = require('express');
const router = express.Router();
const { register, login, getUsers, updateUserAccess } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/register', register);
router.post('/login', login);

// Admin Routes
router.get('/users', authMiddleware, adminMiddleware, getUsers);
router.put('/users/:id/access', authMiddleware, adminMiddleware, updateUserAccess);

module.exports = router;
