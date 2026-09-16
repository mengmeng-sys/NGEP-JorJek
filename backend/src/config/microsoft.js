const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { env } = require("./env");

const JWKS_URL = "https://login.microsoftonline.com/1e9461ec-5362-4329-ae46-61fa3e91c6d2/discovery/v2.0/keys";

let keyCache = null;
let keyCacheTime = 0;
const KEY_CACHE_TTL = 1000 * 60 * 60;

async function getSigningKey(kid) {
  const now = Date.now();
  if (!keyCache || now - keyCacheTime > KEY_CACHE_TTL) {
    const res = await fetch(JWKS_URL);
    if (!res.ok) throw new Error("Failed to fetch Microsoft signing keys");
    keyCache = await res.json();
    keyCacheTime = now;
  }
  const jwk = keyCache.keys.find((k) => k.kid === kid);
  if (!jwk) throw new Error("Matching signing key not found");
  return crypto.createPublicKey({ key: jwk, format: "jwk" }).export({ type: "spki", format: "pem" });
}

async function validateMicrosoftIdToken(token) {
  const [headerB64] = token.split(".");
  const header = JSON.parse(Buffer.from(headerB64, "base64url").toString());
  const pem = await getSigningKey(header.kid);

  const payload = jwt.verify(token, pem, {
    algorithms: ["RS256"],
    audience: env.microsoftClientId,
  });

  const email = (payload.email || payload.preferred_username || "").toLowerCase();
  if (!email) throw new Error("No email in token");

  return {
    email,
    name: payload.name || payload.preferred_username || "",
    oid: payload.oid,
  };
}

module.exports = { validateMicrosoftIdToken };
