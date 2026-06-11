const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const authMiddleware = require('../middleware/authMiddleware');
const proMiddleware = require('../middleware/proMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for WhatsApp campaign images (using memory storage for Cloud compatibility)
const upload = multer({ storage: multer.memoryStorage() });

// All WhatsApp routes require authentication and Pro plan
router.use(authMiddleware);
router.use(proMiddleware);

// Connection Management
router.get('/status', whatsappController.getConnectionStatus);
router.get('/qr', whatsappController.getQR);
router.post('/logout', whatsappController.logout);

// Settings (Legacy/Misc)
router.get('/settings', whatsappController.getSettings);
router.post('/settings', whatsappController.updateSettings);

// Contacts
router.get('/contacts', whatsappController.getContacts);
router.post('/contacts', whatsappController.addContact);
router.put('/contacts/:id', whatsappController.updateContact);
router.delete('/contacts/:id', whatsappController.deleteContact);
router.post('/contacts/import', whatsappController.importContacts);

// Campaigns
router.get('/campaigns', whatsappController.getCampaigns);
router.post('/campaigns', upload.single('image'), whatsappController.createCampaign);
router.put('/campaigns/:id', upload.single('image'), whatsappController.updateCampaign);
router.delete('/campaigns/:id', whatsappController.deleteCampaign);
router.get('/campaigns/:id/audience', whatsappController.getCampaignAudience);
router.delete('/campaigns/:id/audience/:contactId', whatsappController.removeContactFromCampaign);
router.get('/campaigns/:id/report', whatsappController.getCampaignReport);

module.exports = router;
