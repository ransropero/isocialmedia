const express = require('express');
const router = express.Router();
const shortLinkController = require('../controllers/shortLinkController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas públicas (sem autenticação)
router.get('/resolve/:shortCode', shortLinkController.resolveShortLink);

// Rotas privadas
router.get('/', authMiddleware, shortLinkController.getMyShortLinks);
router.post('/', authMiddleware, shortLinkController.createShortLink);
router.put('/:id', authMiddleware, shortLinkController.updateShortLink);
router.delete('/:id', authMiddleware, shortLinkController.deleteShortLink);
router.get('/:id/analytics', authMiddleware, shortLinkController.getShortLinkAnalytics);

module.exports = router;
