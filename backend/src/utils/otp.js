const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

const logoBuffer = fs.readFileSync(path.join(__dirname, "jorjek_logo.jpg"));
const logoBase64 = `data:image/jpeg;base64,${logoBuffer.toString("base64")}`;

// Single source of truth for the frontend URL used in email CTAs — falls
// back to localhost only for local dev, never hardcoded for the demo/prod build.
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 10);

const BRAND = {
  orange: "#F97316",
  orangeDark: "#EA580C",
  orangeLight: "#FFF7ED",
  dark: "#1E293B",
  gray: "#64748B",
  lightGray: "#F1F5F9",
  white: "#FFFFFF",
};

// Shared header/footer shell so otpEmailHtml and successEmailHtml can't
// drift apart — only the middle "body" section differs between them now.
function emailShell({ title, bodyHtml, footerText, preheader = "" }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:${BRAND.lightGray};font-family:'Segoe UI',Arial,sans-serif;">
  <!-- Hidden preview text shown next to the subject line in most inboxes -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.lightGray};padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background-color:${BRAND.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

        <!-- Header: solid background-color declared first as the fallback for
             clients (Outlook desktop) that don't render linear-gradient at all -->
        <tr><td bgcolor="${BRAND.orangeDark}" style="background-color:${BRAND.orangeDark}; background: linear-gradient(135deg, ${BRAND.orange}, ${BRAND.orangeDark}); padding:32px 40px; text-align:center;">
          <img src="${logoBase64}" alt="JorJek" width="120" style="display:block;margin:0 auto 12px;border-radius:8px;" />
          <h1 style="margin:0;color:${BRAND.white};font-size:22px;font-weight:700;letter-spacing:0.5px;">${title}</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          ${bodyHtml}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:${BRAND.lightGray};padding:20px 40px;text-align:center;border-top:1px solid #E2E8F0;">
          <p style="margin:0;color:${BRAND.gray};font-size:12px;">${footerText}</p>
          <p style="margin:8px 0 0;color:${BRAND.gray};font-size:11px;">JorJek &mdash; CADT Student Platform</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function otpEmailHtml(otp, purpose) {
  const templates = {
    verify: {
      title: "Verify Your Email",
      subtitle: "Your verification code",
      preheader: `Your JorJek verification code is ${otp}`,
      footer: "This email was sent because you signed up for a JorJek account.",
    },
    resend: {
      title: "New Verification Code",
      subtitle: "Your new verification code",
      preheader: `Your new JorJek verification code is ${otp}`,
      footer: "You requested a new verification code. If this wasn't you, ignore this email.",
    },
    reset: {
      title: "Reset Your Password",
      subtitle: "Your password reset code",
      preheader: `Your JorJek password reset code is ${otp}`,
      footer: "You requested a password reset. If this wasn't you, ignore this email.",
    },
  };

  const t = templates[purpose] || templates.verify;

  const bodyHtml = `
    <p style="margin:0 0 8px;color:${BRAND.gray};font-size:14px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">${t.subtitle}</p>
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="background-color:${BRAND.orangeLight};border:2px dashed ${BRAND.orange};border-radius:12px;padding:20px;text-align:center;">
        <span style="font-size:34px;font-weight:800;letter-spacing:8px;color:${BRAND.orangeDark};font-family:'Courier New',monospace;">${otp}</span>
      </td>
    </tr></table>
    <p style="margin:24px 0 0;color:${BRAND.gray};font-size:14px;line-height:1.6;">
      This code expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>. If you did not request this, you can safely ignore this email.
    </p>
    <p style="margin:16px 0 0;color:${BRAND.dark};font-size:13px;line-height:1.6;background-color:${BRAND.lightGray};border-radius:8px;padding:12px 16px;">
      🔒 Never share this code with anyone — JorJek staff will never ask you for it.
    </p>
  `;

  return emailShell({
    title: t.title,
    bodyHtml,
    footerText: t.footer,
    preheader: t.preheader,
  });
}

function successEmailHtml(purpose) {
  const templates = {
    verified: {
      title: "Email Verified!",
      message: "Your email has been successfully verified. You now have full access to your JorJek account.",
      buttonText: "Go to JorJek",
      preheader: "Your JorJek account is now verified.",
      footer: "Welcome to JorJek! Start exploring your campus community.",
    },
    passwordReset: {
      title: "Password Reset Successful",
      message: "Your password has been changed successfully. You can now log in with your new password.",
      buttonText: "Log In",
      preheader: "Your JorJek password was changed.",
      footer: "If you did not request this change, please contact support immediately.",
    },
  };

  const t = templates[purpose] || templates.verified;

  const bodyHtml = `
    <div style="text-align:center;">
      <div style="width:80px;height:80px;border-radius:50%;background-color:#DCFCE7;margin:0 auto 24px;line-height:80px;">
        <span style="font-size:40px;color:#16A34A;">&#10003;</span>
      </div>
      <p style="margin:0 0 24px;color:${BRAND.dark};font-size:16px;line-height:1.6;">${t.message}</p>
      <a href="${FRONTEND_URL}" style="display:inline-block;background:${BRAND.orange};color:${BRAND.white};font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">${t.buttonText}</a>
    </div>
  `;

  return emailShell({
    title: t.title,
    bodyHtml,
    footerText: t.footer,
    preheader: t.preheader,
  });
}

module.exports = { generateOtp, otpEmailHtml, successEmailHtml };