import bcrypt from 'bcrypt';

const SALT_ROUNDS = process.env.NODE_ENV === 'test' ? 4 : 12;

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}