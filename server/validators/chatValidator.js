const { body } = require('express-validator');

const sendMessageValidator = [
  body('receiverId')
    .notEmpty()
    .withMessage('Receiver ID is required.')
    .isMongoId()
    .withMessage('Invalid receiver ID.'),
  body('message')
    .notEmpty()
    .withMessage('Message cannot be empty.')
    .isString()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message must be 1–5000 characters.'),
];

module.exports = { sendMessageValidator };
