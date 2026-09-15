const nodemailer = require("nodemailer");
const dns = require("dns");
const { env } = require("./env");

dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465,
  family: 4,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

async function sendMail({ to, subject, html }) {
  const from = env.smtpFrom || env.smtpUser || "JorJek <no-reply@jorjek.app>";
  console.log(`[MAIL] Sending "${subject}" to ${to} via ${env.smtpHost}:${env.smtpPort}`);
  try {
    const result = await transporter.sendMail({ from, to, subject, html });
    console.log(`[MAIL] Sent successfully: ${result.messageId}`);
    return result;
  } catch (err) {
    console.error(`[MAIL] Failed to send to ${to}: ${err.message}`);
    throw err;
  }
}

module.exports = { sendMail };
