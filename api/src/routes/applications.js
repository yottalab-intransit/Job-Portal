const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Company = require('../models/Company');
const { auth, authorize } = require('../middleware/auth');
const { validateCreateApplication, validateMongoId } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/jobs/:jobId/apply
// @desc    Apply for a job
// @access  Private (Job Seekers)
router.post('/jobs/:jobId/apply', auth, authorize('jobseeker'), validateCreateApplication, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('company');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications'
      });
    }

    if (new Date() > job.applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      job: req.params.jobId,
      applicant: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    const applicationData = {
      job: req.params.jobId,
      applicant: req.user._id,
      company: job.company._id,
      ...req.body
    };

    const application = new Application(applicationData);
    await application.save();

    // Populate application data
    await application.populate([
      { path: 'job', select: 'title company' },
      { path: 'applicant', select: 'name email profile' },
      { path: 'company', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while submitting application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/applications
// @desc    Get user's applications (job seekers) or company applications (employers)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, jobId } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    let populateOptions = [];

    if (req.user.type === 'jobseeker') {
      // Job seeker: get their applications
      query.applicant = req.user._id;
      populateOptions = [
        { path: 'job', populate: { path: 'company', select: 'name logo' } },
        { path: 'company', select: 'name logo' }
      ];
    } else {
      // Employer: get applications for their company's jobs
      const company = await Company.findOne({ owner: req.user._id });
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }

      query.company = company._id;
      populateOptions = [
        { path: 'job', select: 'title' },
        { path: 'applicant', select: 'name email profile' }
      ];
    }

    // Add filters
    if (status) {
      query.status = status;
    }

    if (jobId) {
      query.job = jobId;
    }

    const applications = await Application.find(query)
      .populate(populateOptions)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      data: applications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', auth, validateMongoId(), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('applicant', 'name email profile')
      .populate('company', 'name logo')
      .populate('interviews.interviewer', 'name email')
      .populate('notes.author', 'name');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check authorization
    const isApplicant = application.applicant._id.toString() === req.user._id.toString();
    const isCompanyOwner = req.user.type === 'employer' && 
      await Company.findOne({ _id: application.company._id, owner: req.user._id });

    if (!isApplicant && !isCompanyOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status
// @access  Private (Employers only)
router.put('/:id/status', auth, authorize('employer'), validateMongoId(), async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = [
      'pending', 'reviewing', 'shortlisted', 'interviewed', 
      'offered', 'hired', 'rejected', 'withdrawn'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns the company
    const company = await Company.findOne({ 
      _id: application.company, 
      owner: req.user._id 
    });

    if (!company) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    application.status = status;

    // Add note if provided
    if (note) {
      application.notes.push({
        author: req.user._id,
        content: note,
        isPrivate: true
      });
    }

    await application.save();

    await application.populate([
      { path: 'job', select: 'title' },
      { path: 'applicant', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating application status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/applications/:id/notes
// @desc    Add note to application
// @access  Private (Employers only)
router.post('/:id/notes', auth, authorize('employer'), validateMongoId(), async (req, res) => {
  try {
    const { content, isPrivate = true } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns the company
    const company = await Company.findOne({ 
      _id: application.company, 
      owner: req.user._id 
    });

    if (!company) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add notes to this application'
      });
    }

    application.notes.push({
      author: req.user._id,
      content,
      isPrivate
    });

    await application.save();

    res.json({
      success: true,
      message: 'Note added successfully',
      data: application.notes[application.notes.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while adding note',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/applications/:id/interviews
// @desc    Schedule interview
// @access  Private (Employers only)
router.post('/:id/interviews', auth, authorize('employer'), validateMongoId(), async (req, res) => {
  try {
    const { type, scheduledAt, duration, location, meetingLink } = req.body;

    if (!type || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'Interview type and scheduled time are required'
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns the company
    const company = await Company.findOne({ 
      _id: application.company, 
      owner: req.user._id 
    });

    if (!company) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to schedule interviews for this application'
      });
    }

    const interview = {
      type,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
      interviewer: req.user._id,
      location,
      meetingLink
    };

    application.interviews.push(interview);
    await application.save();

    res.json({
      success: true,
      message: 'Interview scheduled successfully',
      data: application.interviews[application.interviews.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while scheduling interview',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/applications/:id
// @desc    Withdraw application
// @access  Private (Job Seekers only - own applications)
router.delete('/:id', auth, authorize('jobseeker'), validateMongoId(), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns this application
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application'
      });
    }

    // Check if application can be withdrawn
    if (['hired', 'rejected'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw application with current status'
      });
    }

    application.status = 'withdrawn';
    await application.save();

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while withdrawing application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;