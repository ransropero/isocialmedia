const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', accountController.createAccount);
router.get('/', accountController.getAccounts);
router.delete('/:id', accountController.deleteAccount);

module.exports = router;
