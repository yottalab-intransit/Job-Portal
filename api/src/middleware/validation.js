const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Auth validations
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('type')
    .isIn(['jobseeker', 'employer'])
    .withMessage('Type must be either jobseeker or employer'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('type')
    .isIn(['jobseeker', 'employer'])
    .withMessage('Type must be either jobseeker or employer'),
  handleValidationErrors
];

// Job validations
const validateCreateJob = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Job title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Job description must be between 50 and 5000 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('jobType')
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'])
    .withMessage('Invalid job type'),
  body('experience')
    .isIn(['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'])
    .withMessage('Invalid experience level'),
  body('category')
    .isIn([
      'Software Development', 'Data Science', 'Design', 'Marketing', 'Sales',
      'Machine Learning', 'DevOps', 'Product Management', 'Business Analysis',
      'Quality Assurance', 'Customer Support', 'Human Resources', 'Finance',
      'Operations', 'Other'
    ])
    .withMessage('Invalid job category'),
  body('applicationDeadline')
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value <= new Date()) {
        throw new Error('Application deadline must be in the future');
      }
      return true;
    }),
  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),
  body('requirements')
    .isArray({ min: 1 })
    .withMessage('At least one requirement is required'),
  handleValidationErrors
];

const validateUpdateJob = [
  param('id').isMongoId().withMessage('Invalid job ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Job title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Job description must be between 50 and 5000 characters'),
  body('jobType')
    .optional()
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'])
    .withMessage('Invalid job type'),
  body('experience')
    .optional()
    .isIn(['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'])
    .withMessage('Invalid experience level'),
  handleValidationErrors
];

// Company validations
const validateCreateCompany = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Company name must be between 2 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Company description must be between 50 and 2000 characters'),
  body('industry')
    .trim()
    .notEmpty()
    .withMessage('Industry is required'),
  body('size')
    .isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
    .withMessage('Invalid company size'),
  body('location.headquarters')
    .trim()
    .notEmpty()
    .withMessage('Headquarters location is required'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  handleValidationErrors
];

// Application validations
const validateCreateApplication = [
  param('jobId').isMongoId().withMessage('Invalid job ID'),
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Cover letter cannot exceed 2000 characters'),
  body('expectedSalary.min')
    .optional()
    .isNumeric()
    .withMessage('Expected minimum salary must be a number'),
  body('expectedSalary.max')
    .optional()
    .isNumeric()
    .withMessage('Expected maximum salary must be a number'),
  body('noticePeriod')
    .optional()
    .isIn(['Immediate', '15 days', '1 month', '2 months', '3 months', 'More than 3 months'])
    .withMessage('Invalid notice period'),
  handleValidationErrors
];

// Query validations
const validateJobQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'title', 'salary.min', 'applicationsCount'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  handleValidationErrors
];

// ID validations
const validateMongoId = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateJob,
  validateUpdateJob,
  validateCreateCompany,
  validateCreateApplication,
  validateJobQuery,
  validateMongoId,
  handleValidationErrors
};