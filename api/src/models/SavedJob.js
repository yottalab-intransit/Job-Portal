const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job is required']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes
savedJobSchema.index({ user: 1, job: 1 }, { unique: true }); // Prevent duplicate saves
savedJobSchema.index({ user: 1 });
savedJobSchema.index({ job: 1 });
savedJobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SavedJob', savedJobSchema);