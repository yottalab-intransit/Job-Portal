const express = require('express');
const Company = require('../models/Company');
const Job = require('../models/Job');
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const { validateCreateCompany, validateMongoId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/companies
// @desc    Get all companies with filtering and pagination
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      location,
      industry,
      size,
      verified,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (location) {
      query['location.headquarters'] = { $regex: location, $options: 'i' };
    }

    if (industry) {
      query.industry = { $regex: industry, $options: 'i' };
    }

    if (size) {
      query.size = size;
    }

    if (verified !== undefined) {
      query.isVerified = verified === 'true';
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const companies = await Company.find(query)
      .populate('owner', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await Company.countDocuments(query);

    // Add job counts
    for (let company of companies) {
      const jobCount = await Job.countDocuments({ 
        company: company._id, 
        status: 'active' 
      });
      company.activeJobsCount = jobCount;
    }

    res.json({
      success: true,
      data: companies,
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
      message: 'Server error while fetching companies',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/companies/:id
// @desc    Get single company
// @access  Public
router.get('/:id', validateMongoId(), async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('employees.user', 'name email profile.avatar')
      .lean();

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get company jobs
    const jobs = await Job.find({ 
      company: req.params.id, 
      status: 'active' 
    })
      .populate('company', 'name logo')
      .sort({ createdAt: -1 })
      .limit(10);

    company.jobs = jobs;
    company.activeJobsCount = jobs.length;

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching company',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/companies/:id/jobs
// @desc    Get company jobs
// @access  Public
router.get('/:id/jobs', validateMongoId(), async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'active' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const query = { company: req.params.id };
    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .populate('company', 'name logo rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Job.countDocuments(query);

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
      message: 'Server error while fetching company jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/companies
// @desc    Create company
// @access  Private (Employers)
router.post('/', auth, authorize('employer'), validateCreateCompany, async (req, res) => {
  try {
    // Check if user already has a company
    const existingCompany = await Company.findOne({ owner: req.user._id });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'You already have a company profile'
      });
    }

    const companyData = {
      ...req.body,
      owner: req.user._id,
      employees: [{ user: req.user._id, role: 'admin' }]
    };

    const company = new Company(companyData);
    await company.save();

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating company',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/companies/:id
// @desc    Update company
// @access  Private (Company Owner/Admin)
router.put('/:id', auth, authorize('employer'), validateMongoId(), async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if user is owner or admin
    const isOwner = company.owner.toString() === req.user._id.toString();
    const isAdmin = company.employees.some(emp => 
      emp.user.toString() === req.user._id.toString() && emp.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this company'
      });
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: updatedCompany
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating company',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/companies/:id
// @desc    Delete company
// @access  Private (Company Owner only)
router.delete('/:id', auth, authorize('employer'), validateMongoId(), async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if user is owner
    if (company.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this company'
      });
    }

    // Check if company has active jobs
    const activeJobs = await Job.countDocuments({ 
      company: req.params.id, 
      status: 'active' 
    });

    if (activeJobs > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete company with active job postings'
      });
    }

    await Company.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting company',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/companies/:id/employees
// @desc    Add employee to company
// @access  Private (Company Owner/Admin)
router.post('/:id/employees', auth, authorize('employer'), validateMongoId(), async (req, res) => {
  try {
    const { userId, role = 'employee' } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if user is owner or admin
    const isOwner = company.owner.toString() === req.user._id.toString();
    const isAdmin = company.employees.some(emp => 
      emp.user.toString() === req.user._id.toString() && emp.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add employees'
      });
    }

    await company.addEmployee(userId, role);

    res.json({
      success: true,
      message: 'Employee added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while adding employee',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/companies/:id/employees/:userId
// @desc    Remove employee from company
// @access  Private (Company Owner/Admin)
router.delete('/:id/employees/:userId', auth, authorize('employer'), validateMongoId(), async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if user is owner or admin
    const isOwner = company.owner.toString() === req.user._id.toString();
    const isAdmin = company.employees.some(emp => 
      emp.user.toString() === req.user._id.toString() && emp.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove employees'
      });
    }

    // Cannot remove owner
    if (company.owner.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove company owner'
      });
    }

    await company.removeEmployee(req.params.userId);

    res.json({
      success: true,
      message: 'Employee removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while removing employee',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;