const express = require('express');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    let stats = {};

    if (req.user.type === 'jobseeker') {
      // Job seeker dashboard stats
      const [appliedJobs, savedJobs, applications] = await Promise.all([
        Application.countDocuments({ applicant: req.user._id }),
        require('../models/SavedJob').countDocuments({ user: req.user._id }),
        Application.find({ applicant: req.user._id })
          .populate('job', 'title')
          .sort({ createdAt: -1 })
          .limit(5)
      ]);

      // Application status breakdown
      const statusBreakdown = await Application.aggregate([
        { $match: { applicant: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      stats = {
        appliedJobs,
        savedJobs,
        recentApplications: applications,
        statusBreakdown: statusBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        profileViews: Math.floor(Math.random() * 50) + 10, // Mock data
        profileCompleteness: calculateProfileCompleteness(req.user)
      };

    } else {
      // Employer dashboard stats
      const company = await Company.findOne({ owner: req.user._id });
      
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }

      const [activeJobs, totalApplications, recentApplications] = await Promise.all([
        Job.countDocuments({ company: company._id, status: 'active' }),
        Application.countDocuments({ company: company._id }),
        Application.find({ company: company._id })
          .populate('job', 'title')
          .populate('applicant', 'name email')
          .sort({ createdAt: -1 })
          .limit(10)
      ]);

      // Application status breakdown
      const statusBreakdown = await Application.aggregate([
        { $match: { company: company._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      // Job performance stats
      const jobStats = await Job.aggregate([
        { $match: { company: company._id } },
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$viewsCount' },
            totalApplications: { $sum: '$applicationsCount' },
            avgApplicationsPerJob: { $avg: '$applicationsCount' }
          }
        }
      ]);

      stats = {
        activeJobs,
        totalApplications,
        recentApplications,
        statusBreakdown: statusBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        jobStats: jobStats[0] || { totalViews: 0, totalApplications: 0, avgApplicationsPerJob: 0 },
        companyViews: Math.floor(Math.random() * 200) + 50 // Mock data
      };
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/dashboard/analytics
// @desc    Get analytics data
// @access  Private (Employers)
router.get('/analytics', auth, authorize('employer'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const company = await Company.findOne({ owner: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Applications over time
    const applicationsOverTime = await Application.aggregate([
      {
        $match: {
          company: company._id,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Job performance
    const jobPerformance = await Job.aggregate([
      {
        $match: {
          company: company._id,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $project: {
          title: 1,
          viewsCount: 1,
          applicationsCount: 1,
          conversionRate: {
            $cond: [
              { $eq: ['$viewsCount', 0] },
              0,
              { $multiply: [{ $divide: ['$applicationsCount', '$viewsCount'] }, 100] }
            ]
          }
        }
      },
      { $sort: { applicationsCount: -1 } },
      { $limit: 10 }
    ]);

    // Application sources
    const applicationSources = await Application.aggregate([
      {
        $match: {
          company: company._id,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        applicationsOverTime,
        jobPerformance,
        applicationSources
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to calculate profile completeness
function calculateProfileCompleteness(user) {
  const fields = [
    'name',
    'email',
    'profile.phone',
    'profile.location',
    'profile.bio'
  ];

  if (user.type === 'jobseeker') {
    fields.push('profile.experience', 'profile.skills', 'profile.resume');
  } else {
    fields.push('profile.company', 'profile.industry', 'profile.website');
  }

  let completedFields = 0;
  
  fields.forEach(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], user);
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      completedFields++;
    }
  });

  return Math.round((completedFields / fields.length) * 100);
}

module.exports = router;