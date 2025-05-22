const User = require('../models/User');
const { generateOTP, sendOTPEmail } = require('../utils/emailService');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-default-secret-key',
    { expiresIn: '7d' }
  );
};

// Register a new user and send OTP
exports.register = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Generate a new OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP expires in 10 minutes
    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // Update existing user with new OTP
      user.otp = {
        code: otp,
        expiresAt: otpExpiry
      };
      
      await user.save();
    } else {
      // Create a new user
      user = await User.create({
        email,
        otp: {
          code: otp,
          expiresAt: otpExpiry
        }
      });
    }
    
    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }
    
    res.status(200).json({ 
      message: 'OTP sent to your email',
      userId: user._id
    });
    
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const currentTime = new Date();
    
    // Check if OTP is valid and not expired
    if (
      !user.otp || 
      !user.otp.code || 
      user.otp.code !== otp || 
      !user.otp.expiresAt || 
      currentTime > user.otp.expiresAt
    ) {
      return res.status(400).json({ 
        message: currentTime > user.otp.expiresAt 
          ? 'OTP has expired' 
          : 'Invalid OTP'
      });
    }
    
    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    res.status(200).json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified
      }
    });
    
  } catch (error) {
    console.error('Error in OTP verification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate a new OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP expires in 10 minutes
    
    // Update user with new OTP
    user.otp = {
      code: otp,
      expiresAt: otpExpiry
    };
    
    await user.save();
    
    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }
    
    res.status(200).json({ 
      message: 'New OTP sent to your email',
      userId: user._id
    });
    
  } catch (error) {
    console.error('Error in resending OTP:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 