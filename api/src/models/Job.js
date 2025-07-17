const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Job title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [5000, 'Job description cannot exceed 5000 characters']
  },
  requirements: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  remote: {
    type: Boolean,
    default: false
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    required: [true, 'Job type is required']
  },
  experience: {
    type: String,
    required: [true, 'Experience level is required'],
    enum: ['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years']
  },
  salary: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly'
    },
    displayText: String // e.g., "₹10-15 LPA"
  },
  category: {
    type: String,
    required: [true, 'Job category is required'],
    enum: [
      'Software Development',
      'Data Science',
      'Design',
      'Marketing',
      'Sales',
      'Machine Learning',
      'DevOps',
      'Product Management',
      'Business Analysis',
      'Quality Assurance',
      'Customer Support',
      'Human Resources',
      'Finance',
      'Operations',
      'Other'
    ]
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required']
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Posted by user is required']
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'closed', 'draft'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  urgent: {
    type: Boolean,
    default: false
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  benefits: [{
    type: String,
    trim: true
  }],
  workingHours: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  applicationInstructions: {
    type: String,
    maxlength: [1000, 'Application instructions cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ location: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ experience: 1 });
jobSchema.index({ company: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ featured: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ applicationDeadline: 1 });

// Virtual for days since posted
jobSchema.virtual('daysSincePosted').get(function() {
  const diffTime = Math.abs(new Date() - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for application status
jobSchema.virtual('isExpired').get(function() {
  return new Date() > this.applicationDeadline;
});

// Pre-save middleware
jobSchema.pre('save', function(next) {
  if (this.isNew) {
    this.applicationsCount = 0;
    this.viewsCount = 0;
  }
  next();
});

// Static method to get job statistics
jobSchema.statics.getJobStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalJobs: { $sum: 1 },
        activeJobs: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        },
        totalApplications: { $sum: '$applicationsCount' },
        avgSalaryMin: { $avg: '$salary.min' },
        avgSalaryMax: { $avg: '$salary.max' }
      }
    }
  ]);
  
  return stats[0] || {};
};

module.exports = mongoose.model('Job', jobSchema);