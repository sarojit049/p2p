const { body, query } = require('express-validator');

const createUsernameValidator = [
  body('username')
    .notEmpty()
    .withMessage('Username is required.')
    .isString()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3–30 characters.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores.'),
];

const searchUsernameValidator = [
  query('username')
    .notEmpty()
    .withMessage('Search query is required.')
    .isString()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Search query must be 1–30 characters.'),
];

module.exports = { createUsernameValidator, searchUsernameValidator };
