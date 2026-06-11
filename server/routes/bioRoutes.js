const express = require('express');
const router = express.Router();
const bioController = require('../controllers/bioController');
const authMiddleware = require('../middleware/authMiddleware');

const multer = require('multer');
const path = require('path');

const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, 'bio-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Public lookup
router.get('/all-slugs', bioController.getAllSlugs);
router.get('/slug/:slug', bioController.getBioPageBySlug);

router.post('/:id/click', bioController.trackClick);
router.post('/:id/visit', bioController.trackVisit);
router.post('/:id/verify-password', bioController.verifyLinkPassword);

// User protected routes
router.get('/my', authMiddleware, bioController.getMyBioPages);
router.get('/:id/analytics', authMiddleware, bioController.getAnalytics);
router.post('/', authMiddleware, bioController.createBioPage);
router.put('/:id', authMiddleware, bioController.updateBioPage);
router.delete('/:id', authMiddleware, bioController.deleteBioPage);
router.post('/import-linktree', authMiddleware, bioController.importLinktree);
router.post('/upload', authMiddleware, upload.single('image'), bioController.uploadImage);

module.exports = router;
