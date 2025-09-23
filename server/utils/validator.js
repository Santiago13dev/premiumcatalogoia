import validator from 'validator';
import DOMPurify from 'isomorphic-dompurify';

class InputValidator {
  // Sanitize HTML content
  sanitizeHTML(input) {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target', 'rel']
    });
  }

  // Validate and sanitize email
  validateEmail(email) {
    if (!email || !validator.isEmail(email)) {
      throw new Error('Invalid email format');
    }
    return validator.normalizeEmail(email, {
      all_lowercase: true,
      gmail_remove_dots: false
    });
  }

  // Validate username
  validateUsername(username) {
    if (!username || !validator.isAlphanumeric(username.replace(/_/g, ''))) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }
    if (!validator.isLength(username, { min: 3, max: 30 })) {
      throw new Error('Username must be between 3 and 30 characters');
    }
    return username.toLowerCase();
  }

  // Validate password strength
  validatePassword(password) {
    if (!validator.isLength(password, { min: 8 })) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasNonalphas) {
      throw new Error('Password must contain uppercase, lowercase, numbers, and special characters');
    }
    
    return password;
  }

  // Validate URL
  validateURL(url) {
    if (!url || !validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true
    })) {
      throw new Error('Invalid URL format');
    }
    return url;
  }

  // Validate MongoDB ObjectId
  validateObjectId(id) {
    if (!validator.isMongoId(id)) {
      throw new Error('Invalid ID format');
    }
    return id;
  }

  // Sanitize file name
  sanitizeFileName(fileName) {
    return fileName
      .replace(/[^a-zA-Z0-9\.\-_]/g, '')
      .replace(/\.{2,}/g, '.')
      .substring(0, 255);
  }

  // Validate file type
  validateFileType(fileName, allowedTypes) {
    const ext = fileName.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(ext)) {
      throw new Error(`File type .${ext} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
    return true;
  }

  // Validate JSON
  validateJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      return parsed;
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  // Escape special characters for regex
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Validate API key format
  validateAPIKey(key) {
    const pattern = /^[a-zA-Z0-9_-]{32,64}$/;
    if (!pattern.test(key)) {
      throw new Error('Invalid API key format');
    }
    return key;
  }

  // Validate phone number
  validatePhone(phone) {
    if (!validator.isMobilePhone(phone, 'any')) {
      throw new Error('Invalid phone number');
    }
    return phone;
  }

  // Validate date
  validateDate(date) {
    if (!validator.isISO8601(date)) {
      throw new Error('Invalid date format. Use ISO 8601 format');
    }
    return date;
  }

  // Rate limit check for IP
  checkRateLimit(ip, limits = {}) {
    const key = `rate_limit:${ip}`;
    const { maxRequests = 100, windowMs = 60000 } = limits;
    // Implementation would use Redis or in-memory store
    return true;
  }
}

export default new InputValidator();