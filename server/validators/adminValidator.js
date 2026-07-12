const { body } = require('express-validator');

const adminLoginValidator = [
  body('username')
    .notEmpty()
    .withMessage('Username is required.')
    .isString()
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isString(),
];

module.exports = { adminLoginValidator };
