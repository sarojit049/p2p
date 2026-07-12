const { body } = require('express-validator');

/**
 * Validators for Auth Module
 * Per 06_API_SPECIFICATION.md — Validation Rules
 */

const loginValidator = [
  body('secretCode')
    .notEmpty()
    .withMessage('Secret Code is required.')
    .isString()
    .withMessage('Secret Code must be a string.')
    .trim()
    .isLength({ min: 8, max: 64 })
    .withMessage('Invalid Secret Code format.'),
];

module.exports = { loginValidator };
