require("dotenv").config();

const env = {
  port: Number(process.env.PORT ?? 4000),
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  cadtEmailDomain: process.env.CADT_EMAIL_DOMAIN ?? "@cadt.edu.kh",
  notificationTransport: process.env.NOTIFICATION_TRANSPORT ?? "polling", // "polling" | "websocket"
};

module.exports = { env };
