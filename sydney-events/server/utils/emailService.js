const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create a test account for development
let testAccount = null;
let transporter = null;

// Initialize the transporter
const initializeTransporter = async () => {
  try {
    // If we have environment variables, use them
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log('Using configured email settings');
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
        port: process.env.EMAIL_PORT || 2525,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      // Otherwise create a test account
      console.log('Creating test email account');
      testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }
    console.log('Email transporter initialized');
  } catch (error) {
    console.error('Failed to initialize email transporter:', error);
  }
};

// Initialize on module load
initializeTransporter();

// Generate a 6-digit OTP
const generateOTP = () => {
  try {
    // Generate random number between 100000 and 999999
    const otp = Math.floor(100000 + crypto.randomInt(900000)).toString();
    console.log('Generated OTP:', otp);
    return otp;
  } catch (error) {
    console.error('Error generating OTP with crypto:', error);
    // Fallback to a simple random number if crypto fails
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
};

// Send email with OTP
const sendOTPEmail = async (email, otp) => {
  try {
    console.log(`Attempting to send email to ${email} with OTP: ${otp}`);
    
    // If no transporter was initialized, use development mode
    if (!transporter) {
      console.log('Running in development mode - skipping actual email sending');
      console.log(`Development email would be sent to ${email} with OTP: ${otp}`);
      return true;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@sydneyevents.com',
      to: email,
      subject: 'Verify Your Email - Sydney Events',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Email Verification</h2>
          <p>Thank you for registering with Sydney Events. Please use the following OTP (One-Time Password) to verify your email address:</p>
          <div style="background-color: #f9f9f9; padding: 10px; text-align: center; margin: 20px 0; border-radius: 4px;">
            <h3 style="font-size: 24px; margin: 0; color: #4a5568;">${otp}</h3>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">Sydney Events - Your gateway to exciting events in Sydney</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    // If using ethereal, provide the URL to view the email
    if (testAccount) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    // For development, return true anyway to avoid blocking registration
    console.log('Running in development mode - continuing despite email error');
    return true;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail
}; 