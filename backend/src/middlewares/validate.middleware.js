import { body, validationResult } from 'express-validator';

export const validateRegistration = [
  // Validate Username
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required'),
    
  // Validate Email
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),

  // Validate Password
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  // Middleware to check results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return 400 to match the test expectation
      return res.status(400).json({ 
        message: "Validation Error", 
        errors: errors.array() 
      });
    }
    next();
  }
];
