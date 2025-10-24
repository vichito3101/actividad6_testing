// config/auth.js
import jwt from "jsonwebtoken";
import { CompactEncrypt, compactDecrypt } from "jose"; // <-- v4 API
import { createHash } from "crypto";

const SECRET = process.env.JWT_SECRET || "dev-secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// === Clave JWE (AES-256-GCM con 'dir') ===
// Derivamos SIEMPRE a 32 bytes con SHA-256 para evitar errores de longitud.
const JWE_SECRET = process.env.JWE_SECRET || "dev-jwe-secret";
const JWE_KEY = createHash("sha256").update(JWE_SECRET).digest(); // Buffer de 32 bytes

const isCompactJWE = (t) => t.split(".").length === 5;
const isCompactJWS = (t) => t.split(".").length === 3;

/* ===================== JWS (firmado) — lo que ya usabas ===================== */
export const generateToken = (payload) =>
  jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

export const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);

/* ===================== JWE (cifrado) — opcional ===================== */
// Firma un JWS y luego lo cifra en JWE (Nested JWT)
export const generateEncryptedToken = async (payload, { exp } = {}) => {
  const jws = jwt.sign(payload, SECRET, { expiresIn: exp || EXPIRES_IN });
  const encoder = new TextEncoder();
  const jwe = await new CompactEncrypt(encoder.encode(jws))
    .setProtectedHeader({ alg: "dir", enc: "A256GCM", typ: "JWT" })
    .encrypt(JWE_KEY);
  return jwe;
};

export const generateEncryptedRefreshToken = async (payload, { exp } = {}) => {
  const jws = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: exp || REFRESH_EXPIRES_IN,
  });
  const encoder = new TextEncoder();
  const jwe = await new CompactEncrypt(encoder.encode(jws))
    .setProtectedHeader({ alg: "dir", enc: "A256GCM", typ: "JWT" })
    .encrypt(JWE_KEY);
  return jwe;
};

export const decryptAndVerifyEncryptedToken = async (jwe) => {
  const { plaintext } = await compactDecrypt(jwe, JWE_KEY);
  const inner = new TextDecoder().decode(plaintext);
  return jwt.verify(inner, SECRET);
};

export const decryptAndVerifyEncryptedRefresh = async (jwe) => {
  const { plaintext } = await compactDecrypt(jwe, JWE_KEY);
  const inner = new TextDecoder().decode(plaintext);
  return jwt.verify(inner, REFRESH_SECRET);
};

/* ===================== Middleware ===================== */
export const validateToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Token requerido" });

    let payload;
    if (isCompactJWE(token)) {
      payload = await decryptAndVerifyEncryptedToken(token);
    } else if (isCompactJWS(token)) {
      payload = jwt.verify(token, SECRET);
    } else {
      return res.status(400).json({ error: "Formato de token inválido" });
    }
    req.user = payload;
    return next();
  } catch (e) {
    return res
      .status(e.name === "TokenExpiredError" ? 401 : 403)
      .json({ error: e.message });
  }
};
