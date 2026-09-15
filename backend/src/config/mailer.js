const nodemailer = require("nodemailer");
const { env } = require("./env");

// Resend HTTP API runs on port 443, which Render's free tier allows
// (outbound SMTP on 465/587 is blocked there). If RESEND_API_KEY is set,
// use Resend; otherwise fall back to nodemailer/SMTP (e.g. local dev).

const transporter = (() => {
  if (env.resendApiKey) return null;
  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
})();

async function sendViaResend({ to, subject, html }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.resendFrom || env.smtpFrom || "JorJek <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Resend API ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function sendMail({ to, subject, html }) {
  const from = env.smtpFrom || env.smtpUser || "JorJek <no-reply@jorjek.app>";
  console.log(`[MAIL] Sending "${subject}" to ${to} via ${env.resendApiKey ? "Resend (443)" : `${env.smtpHost}:${env.smtpPort}`}`);
  try {
    const result = env.resendApiKey
      ? await sendViaResend({ to, subject, html })
      : await transporter.sendMail({ from, to, subject, html });
    console.log(`[MAIL] Sent successfully: ${result.id || result.messageId}`);
    return result;
  } catch (err) {
    console.error(`[MAIL] Failed to send to ${to}: ${err.message}`);
    throw err;
  }
}

module.exports = { sendMail };
