const express = require('express');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const { 
  validateCreateJob, 
  validateUpdateJob, 
  validateJobQuery, 
  validateMongoId 
} = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs with filtering, sorting, and pagination
// @access  Public
router.get('/', validateJobQuery, optionalAuth, async (req, res) => {
  try {
    const {
      search,
      location,
      category,
      experience,
      jobType,
      salaryMin,
      salaryMax,
      remote,
      featured,
      company,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { status: 'active' };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    if (experience) {
      query.experience = experience;
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (remote !== undefined) {
      query.remote = remote === 'true';
    }

    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    if (company) {
      query.company = company;
    }

    // Salary range filter
    if (salaryMin || salaryMax) {
      query.$and = query.$and || [];
      if (salaryMin) {
        query.$and.push({
          $or: [
            { 'salary.min': { $gte: parseInt(salaryMin) } },
            { 'salary.max': { $gte: parseInt(salaryMin) } }
          ]
        });
      }
      if (salaryMax) {
        query.$and.push({
          $or: [
            { 'salary.min': { $lte: parseInt(salaryMax) } },
            { 'salary.max': { $lte: parseInt(salaryMax) } }
          ]
        });
      }
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const jobs = await Job.find(query)
      .populate('company', 'name logo rating')
      .populate('postedBy', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    // Add saved status for authenticated users
    if (req.user) {
      const savedJobs = await SavedJob.find({ 
        user: req.user._id,
        job: { $in: jobs.map(job => job._id) }
      }).select('job');
      
      const savedJobIds = new Set(savedJobs.map(saved => saved.job.toString()));
      
      jobs.forEach(job => {
        job.isSaved = savedJobIds.has(job._id.toString());
      });
    }

    res.json({
      success: true,
      data: jobs,
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
      message: 'Server error while fetching jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/jobs/featured
// @desc    Get featured jobs
// @access  Public
router.get('/featured', optionalAuth, async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const jobs = await Job.find({ 
      status: 'active', 
      featured: true 
    })
      .populate('company', 'name logo rating')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Add saved status for authenticated users
    if (req.user) {
      const savedJobs = await SavedJob.find({ 
        user: req.user._id,
        job: { $in: jobs.map(job => job._id) }
      }).select('job');
      
      const savedJobIds = new Set(savedJobs.map(saved => saved.job.toString()));
      
      jobs.forEach(job => {
        job.isSaved = savedJobIds.has(job._id.toString());
      });
    }

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/jobs/saved
// @desc    Get user's saved jobs
// @access  Private (Job Seekers)
router.get('/saved', auth, authorize('jobseeker'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const savedJobs = await SavedJob.find({ user: req.user._id })
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'name logo rating'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await SavedJob.countDocuments({ user: req.user._id });

    const jobs = savedJobs.map(saved => ({
      ...saved.job.toObject(),
      isSaved: true,
      savedAt: saved.createdAt,
      savedNotes: saved.notes,
      savedTags: saved.tags
    }));

    res.json({
      success: true,
      data: jobs,
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
      message: 'Server error while fetching saved jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/jobs/applied
// @desc    Get user's applied jobs
// @access  Private (Job Seekers)
router.get('/applied', auth, authorize('jobseeker'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const applications = await Application.find({ applicant: req.user._id })
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'name logo rating'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Application.countDocuments({ applicant: req.user._id });

    const jobs = applications.map(app => ({
      ...app.job.toObject(),
      applicationStatus: app.status,
      appliedAt: app.createdAt,
      applicationId: app._id
    }));

    res.json({
      success: true,
      data: jobs,
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
      message: 'Server error while fetching applied jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/jobs/categories
// @desc    Get job categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories.map(cat => ({
        name: cat._id,
        count: cat.count
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Public
router.get('/:id', validateMongoId(), optionalAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company')
      .populate('postedBy', 'name email')
      .lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    await Job.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } });

    // Check if user has saved or applied for this job
    if (req.user) {
      const [savedJob, application] = await Promise.all([
        SavedJob.findOne({ user: req.user._id, job: req.params.id }),
        Application.findOne({ applicant: req.user._id, job: req.params.id })
      ]);

      job.isSaved = !!savedJob;
      job.hasApplied = !!application;
      if (application) {
        job.applicationStatus = application.status;
        job.applicationId = application._id;
      }
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/jobs
// @desc    Create new job
// @access  Private (Employers)
router.post('/', auth, authorize('employer'), validateCreateJob, async (req, res) => {
  try {
    // Get user's company
    const company = await Company.findOne({ owner: req.user._id });
    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'You must have a company profile to post jobs'
      });
    }

    const jobData = {
      ...req.body,
      company: company._id,
      postedBy: req.user._id
    };

    const job = new Job(jobData);
    await job.save();

    // Update company job count
    await Company.findByIdAndUpdate(company._id, { $inc: { jobsCount: 1 } });

    // Populate company data
    await job.populate('company');

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job
// @access  Private (Employers - Own jobs only)
router.put('/:id', auth, authorize('employer'), validateUpdateJob, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns this job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('company');

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job
// @access  Private (Employers - Own jobs only)
router.delete('/:id', auth, authorize('employer'), validateMongoId(), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns this job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    // Update company job count
    await Company.findByIdAndUpdate(job.company, { $inc: { jobsCount: -1 } });

    // Delete related applications and saved jobs
    await Promise.all([
      Application.deleteMany({ job: req.params.id }),
      SavedJob.deleteMany({ job: req.params.id })
    ]);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/jobs/:id/save
// @desc    Save/unsave job
// @access  Private (Job Seekers)
router.post('/:id/save', auth, authorize('jobseeker'), validateMongoId(), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const existingSave = await SavedJob.findOne({
      user: req.user._id,
      job: req.params.id
    });

    if (existingSave) {
      await SavedJob.findByIdAndDelete(existingSave._id);
      return res.json({
        success: true,
        message: 'Job removed from saved jobs',
        data: { isSaved: false }
      });
    }

    const savedJob = new SavedJob({
      user: req.user._id,
      job: req.params.id,
      notes: req.body.notes,
      tags: req.body.tags
    });

    await savedJob.save();

    res.json({
      success: true,
      message: 'Job saved successfully',
      data: { isSaved: true }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while saving job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/jobs/:id/save
// @desc    Unsave job
// @access  Private (Job Seekers)
router.delete('/:id/save', auth, authorize('jobseeker'), validateMongoId(), async (req, res) => {
  try {
    const savedJob = await SavedJob.findOneAndDelete({
      user: req.user._id,
      job: req.params.id
    });

    if (!savedJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found in saved jobs'
      });
    }

    res.json({
      success: true,
      message: 'Job removed from saved jobs',
      data: { isSaved: false }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while unsaving job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;