import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const {
  BREVO_SMTP_USER, // Your Brevo account email
  BREVO_SMTP_PASSWORD, // SMTP key from Brevo dashboard
  SENDER_EMAIL_ADDRESS,
} = process.env;

const sendEmail = async (to: string, url: string, txt: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // true for port 465, false for port 587
    auth: {
      user: BREVO_SMTP_USER,
      pass: BREVO_SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: SENDER_EMAIL_ADDRESS,
    to,
    subject: "HelpDex Verification",
    html: `
      <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
        <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to the HelpDex.</h2>
        <p>Congratulations! You're almost set to start using HelpDex.
            Just click the button below to verify your email address.
        </p>

        <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">
          ${txt}
        </a>

        <p>If the button doesn't work, copy and paste this link in your browser:</p>
        <div>${url}</div>
      </div>
    `,
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
