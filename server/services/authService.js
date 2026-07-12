const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SecretCode = require('../models/SecretCode');
const User = require('../models/User');
const logger = require('../utils/logger');

const BCRYPT_ROUNDS = 12;

/**
 * Generate a signed JWT for a user.
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    }
  );
};

/**
 * Login with Secret Code.
 * Iterates through unused SecretCodes and uses bcrypt to find a match.
 * Never exposes which specific code was correct or incorrect.
 */
const loginWithSecretCode = async (secretCode) => {
  // Fetch all unused codes (in MVP with 100 users this is manageable)
  const unusedCodes = await SecretCode.find({ isUsed: false });

  let matchedCode = null;

  for (const codeDoc of unusedCodes) {
    const isMatch = await bcrypt.compare(secretCode, codeDoc.secretCodeHash);
    if (isMatch) {
      matchedCode = codeDoc;
      break;
    }
  }

  if (!matchedCode) {
    const error = new Error('Invalid Secret Code.');
    error.statusCode = 401;
    error.code = 'AUTH_001';
    throw error;
  }

  // Check if code already has a user assigned (returning user)
  if (matchedCode.assignedUser) {
    const user = await User.findById(matchedCode.assignedUser);

    if (!user) {
      const error = new Error('User account not found.');
      error.statusCode = 401;
      throw error;
    }

    if (user.status === 'blocked') {
      const error = new Error('Your account has been blocked. Contact administrator.');
      error.statusCode = 403;
      throw error;
    }

    // Update last seen
    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user);
    return { token, user, isNewUser: false };
  }

  // New user — code not yet assigned
  // Create a placeholder user record without a username
  // Username will be set in the /users/username step
  const newUser = await User.create({
    secretCodeId: matchedCode._id,
    role: 'user',
    status: 'active',
    lastSeen: new Date(),
  });

  // Mark code as used and assign to user
  matchedCode.isUsed = true;
  matchedCode.assignedUser = newUser._id;
  await matchedCode.save();

  logger.info(`New user created with secretCode assignment. UserID: ${newUser._id}`);

  const token = generateToken(newUser);
  return { token, user: newUser, isNewUser: true };
};

/**
 * Hash a plain text password/secret using bcrypt.
 */
const hashValue = async (value) => {
  return bcrypt.hash(value, BCRYPT_ROUNDS);
};

module.exports = {
  loginWithSecretCode,
  generateToken,
  hashValue,
  BCRYPT_ROUNDS,
};
