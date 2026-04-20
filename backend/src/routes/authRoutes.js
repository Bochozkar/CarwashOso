const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Demasiados intentos, intenta de nuevo en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/login', authLimiter, authController.login);
router.get('/me', protect, authController.me);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
