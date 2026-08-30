require("dotenv").config();

const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  cadtEmailDomain: process.env.CADT_EMAIL_DOMAIN ?? "@cadt.edu.kh",
  notificationTransport: process.env.NOTIFICATION_TRANSPORT ?? "polling", // "polling" | "websocket"
};

module.exports = { env };
