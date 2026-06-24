const express = require('express');
const router = express.Router();
const { createCheckoutSession, createPortalSession, verifySubscriptionStatus } = require('../controllers/stripeController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/checkout', authMiddleware, createCheckoutSession);
router.post('/portal', authMiddleware, createPortalSession);
router.post('/verify', authMiddleware, verifySubscriptionStatus);

module.exports = router;
