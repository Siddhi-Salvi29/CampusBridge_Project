import crypto from 'crypto';

const pendingRegistrations = new Map();
const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

export function generateAndStore(email, registrationData) {
  const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  pendingRegistrations.set(email.toLowerCase(), {
    otp,
    registrationData,
    createdAt: Date.now(),
    attemptsLeft: MAX_ATTEMPTS,
  });
  return otp;
}

export function verify(email, submittedOtp) {
  const key = email.toLowerCase();
  const record = pendingRegistrations.get(key);
  if (!record) return { valid: false, error: 'No pending registration found for this email.' };
  if (Date.now() - record.createdAt > EXPIRY_MS) {
    pendingRegistrations.delete(key);
    return { valid: false, error: 'OTP expired. Please register again.' };
  }
  if (record.attemptsLeft <= 0) {
    pendingRegistrations.delete(key);
    return { valid: false, error: 'Too many attempts. Please register again.' };
  }
  if (record.otp !== submittedOtp) {
    record.attemptsLeft -= 1;
    if (record.attemptsLeft <= 0) {
      pendingRegistrations.delete(key);
      return { valid: false, error: 'Too many attempts. Please register again.' };
    }
    return { valid: false, error: `Invalid OTP. ${record.attemptsLeft} attempts remaining.` };
  }
  const { registrationData } = record;
  pendingRegistrations.delete(key);
  return { valid: true, registrationData };
}

export function invalidate(email) {
  pendingRegistrations.delete(email.toLowerCase());
}

export function replace(email, registrationData) {
  invalidate(email);
  return generateAndStore(email, registrationData);
}

export function getPending(key) {
  return pendingRegistrations.get(key) || null;
}
