const express = require('express');
const router = express.Router();
const siteAnalyticsController = require('../controllers/siteAnalyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public route to track visits to main site
router.post('/track', siteAnalyticsController.trackSiteVisit);

// Admin-only route to get site-wide analytics
router.get('/', authMiddleware, adminMiddleware, siteAnalyticsController.getSiteAnalytics);

module.exports = router;
