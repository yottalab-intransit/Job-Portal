const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Company description is required'],
    maxlength: [2000, 'Company description cannot exceed 2000 characters']
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    required: [true, 'Company size is required']
  },
  location: {
    headquarters: {
      type: String,
      required: [true, 'Headquarters location is required'],
      trim: true
    },
    offices: [{
      city: String,
      country: String,
      address: String
    }]
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  logo: {
    type: String,
    default: null
  },
  coverImage: {
    type: String,
    default: null
  },
  founded: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  employees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'hr', 'recruiter', 'employee'],
      default: 'employee'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Company owner is required']
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String,
    github: String
  },
  benefits: [{
    type: String,
    trim: true
  }],
  culture: {
    values: [String],
    workEnvironment: String,
    diversity: String
  },
  rating: {
    overall: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    workLifeBalance: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    compensation: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    careerGrowth: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    management: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  jobsCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  contact: {
    email: String,
    phone: String,
    address: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
companySchema.index({ name: 'text', description: 'text', industry: 'text' });
companySchema.index({ industry: 1 });
companySchema.index({ size: 1 });
companySchema.index({ 'location.headquarters': 1 });
companySchema.index({ owner: 1 });
companySchema.index({ isVerified: 1 });
companySchema.index({ isActive: 1 });
companySchema.index({ 'rating.overall': -1 });

// Virtual for company age
companySchema.virtual('age').get(function() {
  if (!this.founded) return null;
  return new Date().getFullYear() - this.founded;
});

// Virtual for employee count display
companySchema.virtual('employeeCountDisplay').get(function() {
  const sizeMap = {
    '1-10': '1-10 employees',
    '11-50': '11-50 employees',
    '51-200': '51-200 employees',
    '201-500': '201-500 employees',
    '501-1000': '501-1000 employees',
    '1000+': '1000+ employees'
  };
  return sizeMap[this.size] || this.size;
});

// Method to calculate average rating
companySchema.methods.calculateAverageRating = function() {
  const ratings = [
    this.rating.workLifeBalance,
    this.rating.compensation,
    this.rating.careerGrowth,
    this.rating.management
  ].filter(rating => rating > 0);
  
  if (ratings.length === 0) return 0;
  
  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  this.rating.overall = Math.round(average * 10) / 10; // Round to 1 decimal place
  return this.rating.overall;
};

// Method to add employee
companySchema.methods.addEmployee = function(userId, role = 'employee') {
  const existingEmployee = this.employees.find(emp => emp.user.toString() === userId.toString());
  if (!existingEmployee) {
    this.employees.push({ user: userId, role });
  }
  return this.save();
};

// Method to remove employee
companySchema.methods.removeEmployee = function(userId) {
  this.employees = this.employees.filter(emp => emp.user.toString() !== userId.toString());
  return this.save();
};

// Static method to get company statistics
companySchema.statics.getCompanyStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalCompanies: { $sum: 1 },
        verifiedCompanies: {
          $sum: {
            $cond: [{ $eq: ['$isVerified', true] }, 1, 0]
          }
        },
        avgRating: { $avg: '$rating.overall' },
        totalJobs: { $sum: '$jobsCount' }
      }
    }
  ]);
  
  return stats[0] || {};
};

module.exports = mongoose.model('Company', companySchema);