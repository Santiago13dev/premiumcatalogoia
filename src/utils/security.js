// Client-side security utilities

class SecurityUtils {
  // Sanitize user input
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  // Validate email format
  validateEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }

  // Validate password strength
  validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = {
      isValid: false,
      score: 0,
      feedback: []
    };
    
    if (password.length < minLength) {
      strength.feedback.push(`Password must be at least ${minLength} characters`);
    } else {
      strength.score += 25;
    }
    
    if (!hasUpperCase) {
      strength.feedback.push('Add at least one uppercase letter');
    } else {
      strength.score += 25;
    }
    
    if (!hasLowerCase) {
      strength.feedback.push('Add at least one lowercase letter');
    } else {
      strength.score += 25;
    }
    
    if (!hasNumbers) {
      strength.feedback.push('Add at least one number');
    } else {
      strength.score += 15;
    }
    
    if (!hasSpecialChar) {
      strength.feedback.push('Add at least one special character');
    } else {
      strength.score += 10;
    }
    
    strength.isValid = strength.score >= 75;
    
    return strength;
  }

  // Generate secure random string
  generateSecureRandom(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Encrypt data for local storage
  encryptForStorage(data, key) {
    try {
      const jsonString = JSON.stringify(data);
      // Simple XOR encryption for demo (in production use Web Crypto API)
      let encrypted = '';
      for (let i = 0; i < jsonString.length; i++) {
        encrypted += String.fromCharCode(
          jsonString.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return btoa(encrypted);
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  }

  // Decrypt data from local storage
  decryptFromStorage(encryptedData, key) {
    try {
      const encrypted = atob(encryptedData);
      let decrypted = '';
      for (let i = 0; i < encrypted.length; i++) {
        decrypted += String.fromCharCode(
          encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  // Check for XSS attempts
  detectXSS(input) {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]*onerror=/gi,
      /<svg[^>]*onload=/gi
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }

  // Rate limiting for client-side actions
  rateLimit(action, limit = 5, windowMs = 60000) {
    const now = Date.now();
    const key = `rateLimit_${action}`;
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Clean old entries
    const validEntries = data.filter(timestamp => now - timestamp < windowMs);
    
    if (validEntries.length >= limit) {
      return false;
    }
    
    validEntries.push(now);
    localStorage.setItem(key, JSON.stringify(validEntries));
    return true;
  }

  // Validate URL safety
  isSafeURL(url) {
    try {
      const parsed = new URL(url);
      const dangerousProtocols = ['javascript:', 'data:', 'vbscript:'];
      return !dangerousProtocols.includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  // Session timeout manager
  setupSessionTimeout(timeoutMinutes = 30, callback) {
    let timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        callback();
      }, timeoutMinutes * 60 * 1000);
    };
    
    // Reset on user activity
    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetTimeout, true);
    });
    
    resetTimeout();
    
    return () => clearTimeout(timeout);
  }
}

export default new SecurityUtils();