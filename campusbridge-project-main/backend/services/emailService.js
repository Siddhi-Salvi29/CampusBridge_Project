import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

export async function sendOtpEmail(toEmail, otp, type = 'email') {
  const isPhone = type === 'phone';

  const subject = isPhone
    ? 'CampusBridge – Phone Number Verification OTP'
    : 'CampusBridge – Email Verification OTP';

  const purposeText = isPhone
    ? 'verify your phone number'
    : 'verify your email address and complete your registration';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 8px;">
      <div style="background: #1e3a8a; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">CampusBridge</h1>
        <p style="color: #bfdbfe; margin: 5px 0 0 0; font-size: 13px;">Student–Alumni Networking Portal</p>
      </div>

      <div style="background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
        <p style="color: #374151; font-size: 15px;">Dear User,</p>

        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
          Thank you for registering on <strong>CampusBridge</strong>. Please use the One-Time Password (OTP) below to ${purposeText}.
        </p>

        <div style="background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
          <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Your OTP</p>
          <h2 style="color: #1e3a8a; font-size: 40px; letter-spacing: 10px; margin: 0; font-weight: bold;">${otp}</h2>
        </div>

        <p style="color: #374151; font-size: 14px; line-height: 1.6;">
          This OTP is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.
        </p>

        <p style="color: #374151; font-size: 14px; line-height: 1.6;">
          If you did not initiate this request, please ignore this email or contact our support team immediately.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />

        <p style="color: #6b7280; font-size: 13px; margin: 0;">
          Warm regards,<br />
          <strong>The CampusBridge Team</strong><br />
          RMCET Student Placement Portal
        </p>
      </div>

      <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 15px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"CampusBridge" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject,
    html,
  });
}
