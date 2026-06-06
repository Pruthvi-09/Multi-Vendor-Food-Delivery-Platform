
const nodemailer = require("nodemailer");
const dotenv= require('dotenv')
dotenv.config()

const transporter= nodemailer.createTransport({
    service:"gmail",
   port: 465,
   secure:true ,
    auth: {
        user:process.env.EMAIL,
        pass:process.env.PASSWORD
    },
});

// Email Template Base
const getEmailTemplate = (content) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>QuickBite</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #ff4d2d 0%, #ff6b4d 100%);
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          font-size: 36px;
          font-weight: bold;
          color: #ffffff;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .tagline {
          color: #ffffff;
          font-size: 14px;
          opacity: 0.95;
        }
        .content {
          padding: 40px 30px;
        }
        .otp-box {
          background: linear-gradient(135deg, #fff9f6 0%, #ffe8e0 100%);
          border: 2px dashed #ff4d2d;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
        }
        .otp-code {
          font-size: 48px;
          font-weight: bold;
          color: #ff4d2d;
          letter-spacing: 8px;
          margin: 15px 0;
          text-shadow: 2px 2px 4px rgba(255, 77, 45, 0.1);
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 30px;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
          border-top: 1px solid #e9ecef;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #ff4d2d 0%, #ff6b4d 100%);
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          box-shadow: 0 4px 15px rgba(255, 77, 45, 0.3);
        }
        .info-box {
          background-color: #e7f3ff;
          border-left: 4px solid #2196F3;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .emoji {
          font-size: 48px;
          margin: 20px 0;
        }
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #ddd, transparent);
          margin: 30px 0;
        }
        @media only screen and (max-width: 600px) {
          .content {
            padding: 30px 20px;
          }
          .otp-code {
            font-size: 36px;
            letter-spacing: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🍔 QuickBite</div>
          <div class="tagline">Delicious food, delivered fast!</div>
        </div>
        ${content}
        <div class="footer">
          <p><strong>QuickBite</strong> - Your favorite food delivery service</p>
          <p style="margin-top: 10px;">📍 Serving delicious meals to your doorstep</p>
          <p style="margin-top: 10px; font-size: 12px;">
            This is an automated email. Please do not reply to this message.
          </p>
          <div style="margin-top: 20px;">
            <a href="#" style="color: #ff4d2d; text-decoration: none; margin: 0 10px;">Help Center</a>
            <span style="color: #dee2e6;">|</span>
            <a href="#" style="color: #ff4d2d; text-decoration: none; margin: 0 10px;">Contact Us</a>
            <span style="color: #dee2e6;">|</span>
            <a href="#" style="color: #ff4d2d; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
          </div>
          <p style="margin-top: 20px; color: #adb5bd; font-size: 12px;">
            © 2026 QuickBite. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Password Reset OTP Email
let sendOtpMail = async (to, otp) => {
  const content = `
    <div class="content">
      <div class="emoji">🔐</div>
      <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
      <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
        Hello! We received a request to reset your password. Use the OTP below to complete the process.
      </p>
      
      <div class="otp-box">
        <p style="color: #666; font-size: 14px; margin-bottom: 10px;">Your One-Time Password</p>
        <div class="otp-code">${otp}</div>
        <p style="color: #666; font-size: 14px; margin-top: 10px;">Valid for 5 minutes</p>
      </div>

      <div class="warning">
        <strong>⚠️ Security Notice:</strong>
        <p style="margin-top: 8px; font-size: 14px;">
          If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.
        </p>
      </div>

      <div class="divider"></div>

      <div class="info-box">
        <strong>💡 Tips for a Secure Account:</strong>
        <ul style="margin-top: 10px; padding-left: 20px; font-size: 14px;">
          <li>Never share your OTP with anyone</li>
          <li>QuickBite will never ask for your OTP via call or message</li>
          <li>Use a strong, unique password for your account</li>
        </ul>
      </div>

      <p style="margin-top: 30px; color: #777; font-size: 14px;">
        Need help? Our support team is here for you 24/7.
      </p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"QuickBite 🍔" <${process.env.EMAIL}>`,
    to: to,
    subject: '🔐 Reset Your QuickBite Password',
    html: getEmailTemplate(content),
  });

  console.log("Password Reset Email sent:", info.response);
}
 
// Delivery OTP Email
let sendDeliveryOtpMail = async (user, otp) => {
  const content = `
    <div class="content">
      <div class="emoji">🛵</div>
      <h2 style="color: #333; margin-bottom: 20px;">Your Order is Here! 🎉</h2>
      <p style="font-size: 16px; color: #555; margin-bottom: 10px;">
        Hi <strong>${user.fullname}</strong>,
      </p>
      <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
        Great news! Your delicious order has arrived at your doorstep. To complete the delivery, please share the OTP below with your delivery partner.
      </p>
      
      <div class="otp-box">
        <p style="color: #666; font-size: 14px; margin-bottom: 10px;">🔒 Delivery Verification Code</p>
        <div class="otp-code">${otp}</div>
        <p style="color: #666; font-size: 14px; margin-top: 10px;">⏱️ Valid for 5 minutes</p>
      </div>

      <div class="info-box">
        <strong>📋 How to use this OTP:</strong>
        <ol style="margin-top: 10px; padding-left: 20px; font-size: 14px; line-height: 1.8;">
          <li>Share this 4-digit code with your delivery partner</li>
          <li>Verify your order details before sharing the OTP</li>
          <li>Collect your delicious food and enjoy! 😋</li>
        </ol>
      </div>

      <div class="warning">
        <strong>⚠️ Important:</strong>
        <p style="margin-top: 8px; font-size: 14px;">
          Only share this OTP with the QuickBite delivery partner at your doorstep. Never share it over phone, email, or message.
        </p>
      </div>

      <div class="divider"></div>

      <p style="text-align: center; color: #777; font-size: 16px; margin-top: 30px;">
        Thank you for choosing QuickBite! 🙏
      </p>
      <p style="text-align: center; color: #ff4d2d; font-size: 18px; font-weight: 600; margin-top: 10px;">
        Enjoy Your Food! 🍽️
      </p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"QuickBite Delivery 🛵" <${process.env.EMAIL}>`,
    to: user.email,
    subject: '🛵 Your QuickBite Order Has Arrived!',
    html: getEmailTemplate(content),
  });

  console.log("Delivery OTP Email sent:", info.response);
}

module.exports = { sendOtpMail, sendDeliveryOtpMail };


