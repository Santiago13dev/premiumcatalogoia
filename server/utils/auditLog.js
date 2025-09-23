import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN', 'LOGOUT', 'REGISTER',
      'CREATE', 'UPDATE', 'DELETE',
      'VIEW', 'DOWNLOAD', 'SHARE',
      'API_CALL', 'PERMISSION_CHANGE',
      'PASSWORD_CHANGE', 'PROFILE_UPDATE',
      'FAILED_LOGIN', 'UNAUTHORIZED_ACCESS'
    ]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userEmail: String,
  userRole: String,
  resourceType: String,
  resourceId: String,
  changes: mongoose.Schema.Types.Mixed,
  metadata: {
    ip: String,
    userAgent: String,
    method: String,
    path: String,
    query: mongoose.Schema.Types.Mixed,
    body: mongoose.Schema.Types.Mixed,
    headers: mongoose.Schema.Types.Mixed
  },
  result: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'PARTIAL'],
    default: 'SUCCESS'
  },
  errorMessage: String,
  duration: Number,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes for efficient querying
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });
auditLogSchema.index({ 'metadata.ip': 1, timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

class AuditLogger {
  async log(data) {
    try {
      const log = new AuditLog(data);
      await log.save();
      return log;
    } catch (error) {
      console.error('Audit log error:', error);
      // Don't throw error to avoid disrupting main flow
    }
  }
  
  // Middleware to automatically log requests
  middleware() {
    return async (req, res, next) => {
      const startTime = Date.now();
      const originalSend = res.send;
      
      // Capture response
      res.send = function(data) {
        res.send = originalSend;
        
        // Log based on response status
        const shouldLog = [
          req.method !== 'GET',
          res.statusCode >= 400,
          req.path.includes('/api/auth'),
          req.path.includes('/api/admin')
        ].some(condition => condition);
        
        if (shouldLog) {
          const auditData = {
            action: this.getAction(req.method, req.path, res.statusCode),
            userId: req.user?.id,
            userEmail: req.user?.email,
            userRole: req.user?.role,
            resourceType: this.getResourceType(req.path),
            resourceId: req.params?.id,
            metadata: {
              ip: req.ip,
              userAgent: req.get('user-agent'),
              method: req.method,
              path: req.path,
              query: req.query,
              body: this.sanitizeBody(req.body)
            },
            result: res.statusCode < 400 ? 'SUCCESS' : 'FAILURE',
            errorMessage: res.statusCode >= 400 ? data : undefined,
            duration: Date.now() - startTime
          };
          
          this.log(auditData);
        }
        
        return originalSend.call(this, data);
      }.bind(this);
      
      next();
    };
  }
  
  getAction(method, path, statusCode) {
    if (path.includes('/auth/login')) return statusCode < 400 ? 'LOGIN' : 'FAILED_LOGIN';
    if (path.includes('/auth/logout')) return 'LOGOUT';
    if (path.includes('/auth/register')) return 'REGISTER';
    
    const methodActions = {
      'GET': 'VIEW',
      'POST': 'CREATE',
      'PUT': 'UPDATE',
      'PATCH': 'UPDATE',
      'DELETE': 'DELETE'
    };
    
    return methodActions[method] || 'UNKNOWN';
  }
  
  getResourceType(path) {
    if (path.includes('/components')) return 'COMPONENT';
    if (path.includes('/users')) return 'USER';
    if (path.includes('/auth')) return 'AUTH';
    if (path.includes('/analytics')) return 'ANALYTICS';
    return 'UNKNOWN';
  }
  
  sanitizeBody(body) {
    if (!body) return null;
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
  
  // Query audit logs
  async query(filters = {}, options = {}) {
    const {
      userId,
      action,
      resourceType,
      startDate,
      endDate,
      result,
      ip
    } = filters;
    
    const {
      limit = 100,
      skip = 0,
      sort = { timestamp: -1 }
    } = options;
    
    const query = {};
    
    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;
    if (result) query.result = result;
    if (ip) query['metadata.ip'] = ip;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    return await AuditLog
      .find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate('userId', 'username email');
  }
  
  // Get user activity
  async getUserActivity(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await this.query(
      { userId, startDate },
      { limit: 500 }
    );
  }
  
  // Get suspicious activities
  async getSuspiciousActivities() {
    const suspiciousActions = [
      'FAILED_LOGIN',
      'UNAUTHORIZED_ACCESS',
      'PERMISSION_CHANGE'
    ];
    
    return await AuditLog
      .find({
        action: { $in: suspiciousActions },
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
      .sort({ timestamp: -1 })
      .limit(100);
  }
}

export default new AuditLogger();