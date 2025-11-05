import crypto from 'crypto';

const key = Buffer.from('0123456789abcdef0123456789abcdef'); // 256-bit key
const iv = Buffer.from('I8zyA4lVhMCaJ5Kg'); // 16 bytes for AES-CBC

export const encrypt = (data: string): string => {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(data, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

export const decrypt = (data: string): string => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(data, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
};