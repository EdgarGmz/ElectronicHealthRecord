import { hashPassword, comparePassword } from '../../utils/password';

describe('Password Utility (Unit Test)', () => {
  it('should hash a password and verify it correctly', async () => {
    const password = 'mySecretPassword123';
    const hash = await hashPassword(password);
    
    expect(hash).toBeDefined();
    expect(hash).not.toEqual(password); // White box: check hash structure
    expect(hash.startsWith('$2b$')).toBe(true); // White box: check bcrypt prefix
    
    const isValid = await comparePassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('should return false for incorrect password', async () => {
    const password = 'mySecretPassword123';
    const hash = await hashPassword(password);
    
    const isValid = await comparePassword('wrongPassword', hash);
    expect(isValid).toBe(false);
  });
});
