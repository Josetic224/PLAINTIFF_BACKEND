import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';

// Custom validator function for username
const isNameValid = (value: any) => {
    const allowedCharacters = /^[a-zA-Z]+$/;
    return allowedCharacters.test(value);
};

// Relaxed password validation regex pattern
const passwordRegex = /^.{6,}$/;

// Validation middleware for user registration
export const validateUserRegistration = [
    // Validate username
    check('legalFirmName')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 20 }).withMessage('legalFirmName must be between 3 and 20 characters long')
        .custom(isNameValid).withMessage('Invalid characters in the username. Only alphanumeric characters and underscores are allowed'),
 
    // Validate email
    check('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address'),

    // Validate password with relaxed rules
    check('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .matches(passwordRegex).withMessage('Password must be at least 6 characters long'),

    // Handle validation errors
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        next();
    },
];

// Custom middleware to handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
