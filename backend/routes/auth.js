const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const registerRules = [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Kullanıcı adı 3-30 karakter olmalı'),
  body('email').isEmail().withMessage('Geçerli bir email giriniz'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı')
];

const loginRules = [
  body('email').isEmail().withMessage('Geçerli bir email giriniz'),
  body('password').notEmpty().withMessage('Şifre zorunlu')
];

router.post('/register', registerRules, ctrl.register);
router.post('/login', loginRules, ctrl.login);
router.post('/logout', protect, ctrl.logout);
router.get('/verify-email', ctrl.verifyEmail);
router.post('/resend-verification', ctrl.resendVerification);
router.post('/password-reset', ctrl.passwordResetRequest);
router.post('/password-reset/confirm', ctrl.passwordResetConfirm);
router.post('/refresh-token', ctrl.refreshToken);
router.get('/me', protect, ctrl.getMe);
router.get('/verify-email', ctrl.verifyEmail);
router.post('/resend-verification', ctrl.resendVerification);
module.exports = router;