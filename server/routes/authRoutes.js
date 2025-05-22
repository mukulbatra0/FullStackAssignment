const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register a new user and send OTP
router.post('/register', authController.register);

// Verify OTP
router.post('/verify-otp', authController.verifyOTP);

// Resend OTP
router.post('/resend-otp', authController.resendOTP);

module.exports = router; 