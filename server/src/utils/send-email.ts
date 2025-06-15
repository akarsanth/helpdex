import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const { BREVO_SMTP_USER, BREVO_SMTP_PASSWORD, SENDER_EMAIL_ADDRESS } =
  process.env;

interface EmailOptions {
  to: string;
  subject: string;
  heading?: string;
  message: string;
  buttonText?: string;
  buttonUrl?: string;
  otp?: string; // Optional: for OTP-based emails
}

const sendEmail = async ({
  to,
  subject,
  heading = "Notification from HelpDex",
  message,
  buttonText,
  buttonUrl,
  otp,
}: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: BREVO_SMTP_USER,
      pass: BREVO_SMTP_PASSWORD,
    },
  });

  // If buttonText & URL exist, show button
  const buttonHTML =
    buttonText && buttonUrl
      ? `<a href="${buttonUrl}" style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">
           ${buttonText}
         </a>`
      : "";

  // Show OTP block if provided
  const otpBlock = otp
    ? `<div style="margin-top: 20px;">
         <strong style="font-size: 24px; color: darkblue;">Your OTP: ${otp}</strong>
       </div>`
    : "";

  // Fallback plain URL text
  const fallbackURL = buttonUrl
    ? `<p>If the button doesn't work, copy and paste this link into your browser:</p>
       <div>${buttonUrl}</div>`
    : "";

  const htmlContent = `
    <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
      <h2 style="text-align: center; text-transform: uppercase; color: teal;">${heading}</h2>
      <p>${message}</p>
      ${buttonHTML}
      ${otpBlock}
      ${fallbackURL}
    </div>
  `;

  const mailOptions = {
    from: SENDER_EMAIL_ADDRESS,
    to,
    subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmail;
