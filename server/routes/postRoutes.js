const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const postController = require('../controllers/postController');

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', upload.single('image'), postController.createPost);
router.get('/', postController.getPosts);
router.delete('/:id', postController.deletePost);
router.put('/:id', postController.updatePost);

module.exports = router;
