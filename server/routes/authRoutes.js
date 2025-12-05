const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { signup, login, getProfile, updateProfile } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;
