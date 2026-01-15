const express = require('express');
const router = express.Router();
const { check, body } = require('express-validator');
const { 
  signup, 
  signin, 
  validate2FA, 
  requestNewAccessToken, 
  validateAccessToken, 
  getUserInfo,
  getMe,
  updateProfile
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequestMiddleware');

// LEGACY ROUTES (Giữ lại cho backward compatibility)
router.post('/register',
  [
    check('username', 'Username must not be empty.').not().isEmpty(),
    check('password', 'Password must have at least 6 characters.').isLength({ min: 6 })
  ],
  validateRequest,
  signup);

router.post('/login', signin);

router.get('/me', verifyToken, getMe);

router.put('/profile', verifyToken, updateProfile);


// NEW ROUTES (From happy-food-backend)
router.get('/health', (req, res) => {
  return res.status(200).json({ message: "it works bro" });
});

router.post(
  '/signup',
  [
    body('firstName').optional().isString().isLength({ max: 100 }),
    body('lastName').optional().isString().isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 8 }),
  ],
  validateRequest,
  signup
);

router.post(
  '/signin',
  [
    body('email').isString().isLength({ min: 3 }).trim(),
    body('password').isString().isLength({ min: 8 })
  ],
  validateRequest,
  signin
);

router.post(
  '/validate/2fa',
  [
    // body('tempToken').isString().isLength({ min: 10 }),
  ],
  validateRequest,
  validate2FA
);

// Frontend expects POST /api/auth/validate/refresh-token with the refresh token
// in the Authorization header. This reuses the requestNewAccessToken handler.
router.post(
  '/validate/refresh-token',
  [
    body('refreshToken').optional().isString()
  ],
  validateRequest,
  requestNewAccessToken
);

// Frontend expects GET /api/auth/validate/access-token
router.get(
  '/validate/access-token',
  validateAccessToken
);

router.get(
  '/user-info',
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('password').optional().isString().isLength({ min: 8 })
  ],
  verifyToken,
  validateRequest,
  getUserInfo
);


module.exports = router;