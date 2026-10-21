/**
 * Cryptographic & JWT Utilities for LuxeCart Authentication Service
 * Uses standard Web Crypto API for SHA-256 password hashing and standard JWT formatting
 */

// Helper: Convert ArrayBuffer to Hex String
const bufferToHex = (buffer) => {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

// Helper: Base64URL encode
const base64UrlEncode = (str) => {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

// Helper: Base64URL decode
const base64UrlDecode = (str) => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
};

/**
 * Encrypt / Hash password using standard SHA-256
 * @param {string} password
 * @returns {Promise<string>} Hexadecimal SHA-256 hash
 */
export const hashPassword = async (password) => {
  if (!password) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_luxecart_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
};

/**
 * Generate a JSON Web Token (JWT) Access Token
 * @param {object} user - User payload { id, name, email, mobile }
 * @returns {string} Formatted JWT string (header.payload.signature)
 */
export const generateJWT = (user) => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.email,
    id: user.id || `usr_${Date.now()}`,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: 'customer',
    iat: nowInSeconds,
    exp: nowInSeconds + 3600 // 1 hour token expiration
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  // Client-side demo signature using standard hash representation
  const dummySignature = base64UrlEncode(`sig_${user.email}_${nowInSeconds}`);

  return `${encodedHeader}.${encodedPayload}.${dummySignature}`;
};

/**
 * Decode and verify JWT structure
 * @param {string} token
 * @returns {object|null} Decoded { header, payload } or null if invalid
 */
export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));

    return {
      header,
      payload,
      rawToken: token,
      isExpired: payload.exp ? Math.floor(Date.now() / 1000) > payload.exp : false
    };
  } catch (err) {
    console.error('Error decoding JWT token:', err);
    return null;
  }
};

/**
 * Generate a 6-digit random One-Time-Password (OTP)
 * @returns {string} 6-digit numeric OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Password Security Validator (Strict Assignment Rules)
 * Rules:
 * 1. Minimum 8 characters
 * 2. At least one uppercase letter [A-Z]
 * 3. At least one lowercase letter [a-z]
 * 4. At least one numeric digit [0-9]
 * 5. At least one special character [!@#$%^&*...]
 */
export const validatePasswordSecurity = (password) => {
  const checks = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const isValid = Object.values(checks).every(Boolean);

  let message = '';
  if (!checks.minLength) message = 'Password must contain at least 8 characters';
  else if (!checks.hasUpper) message = 'Password must include at least one uppercase letter (A-Z)';
  else if (!checks.hasLower) message = 'Password must include at least one lowercase letter (a-z)';
  else if (!checks.hasDigit) message = 'Password must include at least one numeric digit (0-9)';
  else if (!checks.hasSpecial) message = 'Password must include at least one special character (!@#$%^&*)';

  return { isValid, checks, message };
};
