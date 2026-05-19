import crypto from 'crypto';

export function generateDeviceKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashDeviceKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}