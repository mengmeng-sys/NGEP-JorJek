require("dotenv").config();

const env = {
  port: Number(process.env.PORT ?? 4000),
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "",
  cadtEmailDomain: process.env.CADT_EMAIL_DOMAIN ?? "@student.cadt.edu.kh",
  notificationTransport: process.env.NOTIFICATION_TRANSPORT ?? "polling", // "polling" | "websocket"
  smtpHost: process.env.SMTP_HOST ?? "smtp.gmail.com",
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  smtpFrom: process.env.SMTP_FROM ?? "",
};

module.exports = { env };
