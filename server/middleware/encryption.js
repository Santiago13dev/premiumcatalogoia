import crypto from 'crypto';
import bcrypt from 'bcryptjs';

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.secretKey = Buffer.from(process.env.ENCRYPTION_KEY || crypto.randomBytes(32));
    this.saltRounds = 12;
  }

  // Encrypt sensitive data
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  // Decrypt sensitive data
  decrypt(encryptedData) {
    const { encrypted, iv, authTag } = encryptedData;
    
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.secretKey,
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Hash password with bcrypt
  async hashPassword(password) {
    return await bcrypt.hash(password, this.saltRounds);
  }

  // Verify password
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  // Generate secure random token
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Generate API key
  generateAPIKey() {
    const prefix = 'ak';
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(24).toString('hex');
    return `${prefix}_${timestamp}_${random}`;
  }

  // Hash data with SHA256
  hashSHA256(data) {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }

  // Generate HMAC
  generateHMAC(data, secret = this.secretKey) {
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex');
  }

  // Verify HMAC
  verifyHMAC(data, hmac, secret = this.secretKey) {
    const expectedHMAC = this.generateHMAC(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(hmac),
      Buffer.from(expectedHMAC)
    );
  }

  // Generate OTP (One-Time Password)
  generateOTP(length = 6) {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }

  // Encrypt API key for storage
  encryptAPIKey(apiKey) {
    const hash = this.hashSHA256(apiKey);
    const encrypted = this.encrypt(apiKey);
    return {
      hash,
      encrypted
    };
  }

  // Mask sensitive data for logs
  maskSensitiveData(data, fieldsToMask = ['password', 'apiKey', 'token']) {
    const masked = { ...data };
    fieldsToMask.forEach(field => {
      if (masked[field]) {
        masked[field] = '***MASKED***';
      }
    });
    return masked;
  }
}

export default new EncryptionService();