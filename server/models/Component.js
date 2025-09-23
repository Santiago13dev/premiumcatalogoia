import mongoose from 'mongoose';

const componentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Component name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Component type is required'],
    enum: ['model', 'dataset', 'prompt'],
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  image: {
    type: String,
    default: 'https://source.unsplash.com/600x400/?technology,ai'
  },
  usage: {
    type: String,
    maxlength: [5000, 'Usage example cannot exceed 5000 characters']
  },
  prompt: {
    type: String,
    required: function() {
      return this.type === 'prompt';
    }
  },
  documentation: {
    type: String,
    maxlength: [10000, 'Documentation cannot exceed 10000 characters']
  },
  githubUrl: String,
  websiteUrl: String,
  paperUrl: String,
  metrics: {
    accuracy: Number,
    speed: Number,
    size: String,
    license: String
  },
  requirements: [String],
  dependencies: [String],
  version: {
    type: String,
    default: '1.0.0'
  },
  author: {
    name: String,
    email: String,
    organization: String
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'deprecated', 'beta', 'coming_soon'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better search performance
componentSchema.index({ name: 'text', description: 'text' });
componentSchema.index({ type: 1, tags: 1 });
componentSchema.index({ createdAt: -1 });
componentSchema.index({ views: -1 });

// Virtual for popularity score
componentSchema.virtual('popularity').get(function() {
  return (this.views * 0.3) + (this.likes * 0.5) + (this.downloads * 0.2);
});

// Pre-save middleware
componentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to increment stats
componentSchema.methods.incrementStat = function(stat) {
  if (['views', 'likes', 'downloads'].includes(stat)) {
    this[stat] = (this[stat] || 0) + 1;
    return this.save();
  }
  throw new Error('Invalid stat type');
};

// Static method for trending components
componentSchema.statics.getTrending = function(limit = 10) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return this.find({
    status: 'active',
    updatedAt: { $gte: oneWeekAgo }
  })
  .sort({ views: -1, likes: -1 })
  .limit(limit);
};

const Component = mongoose.model('Component', componentSchema);

export default Component;