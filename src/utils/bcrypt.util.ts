import bcrypt from 'bcrypt';

const bcryptUtil = {
  /**
   * Compare a plain text password with a hashed password
   * @param plainPassword - The plain password to compare
   * @param hashedPassword - The hashed password to compare against
   * @returns Promise<boolean> - true if matched, false otherwise
   */
  compareHash: (plainPassword: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  /**
   * Create a hashed version of a plain password
   * @param plainPassword - The plain password to hash
   * @returns Promise<string> - The hashed password
   */
  createHash: (plainPassword: string): Promise<string> => {
    return bcrypt.hash(plainPassword, 10); // 10 is the salt rounds
  },
};

export default bcryptUtil;
