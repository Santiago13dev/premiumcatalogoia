import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['view', 'click', 'interaction', 'search', 'download', 'share']
  },
  componentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Component'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: String,
  action: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // Auto-delete after 30 days
  }
});

// Indexes
analyticsSchema.index({ componentId: 1, type: 1, createdAt: -1 });
analyticsSchema.index({ userId: 1, createdAt: -1 });
analyticsSchema.index({ sessionId: 1 });
analyticsSchema.index({ createdAt: -1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;