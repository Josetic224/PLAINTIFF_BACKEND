import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';

// Custom validator function for username
const isNameValid = (value: any) => {
    const allowedCharacters = /^[a-zA-Z]+$/;
    return allowedCharacters.test(value);
};

// Custom validator function for phone number
const isPhoneNumberValid = (value: any) => {
    const phoneNumberRegex = /^[0-9]+$/; // Regex pattern to allow only numbers
    return phoneNumberRegex.test(value);
};

// Relaxed password validation regex pattern
const passwordRegex = /^.{6,}$/;

// Validation middleware for user registration
export const validateUserRegistration = [
    // Validate FirmName
    check('FirmName')
        .trim()
        .notEmpty().withMessage('FirmName is required')
        .isLength({ min: 3, max: 20 }).withMessage('FirmName must be between 3 and 20 characters long')
        .custom(isNameValid).withMessage('Invalid characters in the FirmName. Only alphanumeric characters are allowed'),

    // Validate PhoneNumber
    check('PhoneNumber')
        .trim()
        .notEmpty().withMessage('PhoneNumber is required')
        .isLength({ min: 11, max: 11 }).withMessage('PhoneNumber must be 11 digits long')
        .custom(isPhoneNumberValid).withMessage('Invalid characters in the PhoneNumber. Only numbers are allowed'),

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

// Validation middleware for user login
export const validateUserLogin = [
    // Validate email
    check('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address'),

    // Validate password
    check('password')
        .trim()
        .notEmpty().withMessage('Password is required'),

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
