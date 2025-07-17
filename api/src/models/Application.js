const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job is required']
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Applicant is required']
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  coverLetter: {
    type: String,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  resume: {
    type: String, // URL to resume file
    required: [true, 'Resume is required']
  },
  portfolio: {
    type: String // URL to portfolio
  },
  expectedSalary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  availableFrom: {
    type: Date
  },
  noticePeriod: {
    type: String,
    enum: ['Immediate', '15 days', '1 month', '2 months', '3 months', 'More than 3 months']
  },
  answers: [{
    question: String,
    answer: String
  }],
  notes: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: true
    }
  }],
  interviews: [{
    type: {
      type: String,
      enum: ['phone', 'video', 'in-person', 'technical', 'hr']
    },
    scheduledAt: Date,
    duration: Number, // in minutes
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    location: String,
    meetingLink: String,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    },
    feedback: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  timeline: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  source: {
    type: String,
    enum: ['website', 'linkedin', 'referral', 'job-board', 'email', 'other'],
    default: 'website'
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true }); // Prevent duplicate applications
applicationSchema.index({ job: 1 });
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ company: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });
applicationSchema.index({ isStarred: 1 });

// Virtual for days since application
applicationSchema.virtual('daysSinceApplied').get(function() {
  const diffTime = Math.abs(new Date() - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update timeline
applicationSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      changedAt: new Date()
    });
  }
  next();
});

// Post-save middleware to update job application count
applicationSchema.post('save', async function() {
  if (this.isNew) {
    await mongoose.model('Job').findByIdAndUpdate(
      this.job,
      { $inc: { applicationsCount: 1 } }
    );
  }
});

// Post-remove middleware to update job application count
applicationSchema.post('remove', async function() {
  await mongoose.model('Job').findByIdAndUpdate(
    this.job,
    { $inc: { applicationsCount: -1 } }
  );
});

// Method to add interview
applicationSchema.methods.addInterview = function(interviewData) {
  this.interviews.push(interviewData);
  return this.save();
};

// Method to add note
applicationSchema.methods.addNote = function(noteData) {
  this.notes.push(noteData);
  return this.save();
};

// Static method to get application statistics
applicationSchema.statics.getApplicationStats = async function(filters = {}) {
  const matchStage = {};
  if (filters.company) matchStage.company = filters.company;
  if (filters.job) matchStage.job = filters.job;
  if (filters.dateFrom) matchStage.createdAt = { $gte: new Date(filters.dateFrom) };
  if (filters.dateTo) {
    matchStage.createdAt = { 
      ...matchStage.createdAt, 
      $lte: new Date(filters.dateTo) 
    };
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalApplications: { $sum: 1 },
        pendingApplications: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        reviewingApplications: {
          $sum: { $cond: [{ $eq: ['$status', 'reviewing'] }, 1, 0] }
        },
        shortlistedApplications: {
          $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] }
        },
        hiredApplications: {
          $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] }
        },
        rejectedApplications: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {};
};

module.exports = mongoose.model('Application', applicationSchema);