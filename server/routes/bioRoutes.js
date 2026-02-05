const express = require('express');
const router = express.Router();
const bioController = require('../controllers/bioController');
const authMiddleware = require('../middleware/authMiddleware');

const multer = require('multer');
const path = require('path');

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'bio-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Public lookup
router.get('/slug/:slug', bioController.getBioPageBySlug);

// User protected routes
router.get('/my', authMiddleware, bioController.getMyBioPages);
router.post('/', authMiddleware, bioController.createBioPage);
router.put('/:id', authMiddleware, bioController.updateBioPage);
router.delete('/:id', authMiddleware, bioController.deleteBioPage);
router.post('/upload', authMiddleware, upload.single('image'), bioController.uploadImage);

module.exports = router;
