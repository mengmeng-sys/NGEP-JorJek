const crypto = require("crypto");
const { TOTP, generateSecret, generateURI, verifySync } = require("otplib");

const totp = new TOTP({
  digits: 6,
  step: 30,
  window: 1,
});

function generateTotpSecret() {
  return generateSecret();
}

function verifyToken(secret, token) {
  try {
    const result = verifySync({
      token,
      secret,
      digits: 6,
      step: 30,
      window: 1,
    });
    if (result && typeof result === "object") return result.valid === true;
    return result === true;
  } catch {
    return false;
  }
}

function getOtpauthUri(secret, email) {
  return generateURI({
    secret,
    label: email,
    issuer: "JorJek",
    type: "totp",
    digits: 6,
    period: 30,
  });
}

function generateBackupCodes(count = 8) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(
      crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase()
        .match(/.{1,4}/g)
        .join("-")
    );
  }
  return codes;
}

function hashBackupCodes(codes) {
  return codes.map((code) =>
    crypto
      .createHash("sha256")
      .update(code.replace(/-/g, "").toLowerCase())
      .digest("hex")
  );
}

function verifyBackupCode(code, hashedCodes) {
  const hash = crypto
    .createHash("sha256")
    .update(code.replace(/-/g, "").toLowerCase())
    .digest("hex");
  return hashedCodes.includes(hash);
}

module.exports = {
  generateTotpSecret,
  verifyToken,
  getOtpauthUri,
  generateBackupCodes,
  hashBackupCodes,
  verifyBackupCode,
};
