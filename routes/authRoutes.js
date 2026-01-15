const express = require('express');
const router = express.Router();
const { check } = require('express-validator'); // Validate
const authController = require('../controllers/authController');    // Import auth controller
const verifyToken = require('../middleware/authMiddleware');        // Import verifyToken middleware

// Đăng ký
router.post('/register', [          // Examples
  check('username', 'Username must not be empty.').not().isEmpty(),
  check('password', 'Password must have at least 6 characters.').isLength({ min: 6 })
], authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Lấy thông tin Profile
router.get('/me', verifyToken, authController.getMe);

// Update profile
router.put('/profile', verifyToken, authController.updateProfile);

module.exports = router;