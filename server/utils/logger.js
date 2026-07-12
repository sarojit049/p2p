/**
 * Logger Utility
 * Simple console logger.
 * NEVER logs passwords, JWTs, Secret Codes, or sensitive credentials.
 * Per 13_SECURITY_POLICY.md section 15.
 */

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const levels = { error: 0, warn: 1, info: 2, debug: 3 };

const currentLevel = levels[LOG_LEVEL] ?? levels.info;

const logger = {
  error: (message, ...args) => {
    if (currentLevel >= levels.error) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
    }
  },

  warn: (message, ...args) => {
    if (currentLevel >= levels.warn) {
      console.warn(`[WARN]  ${new Date().toISOString()} - ${message}`, ...args);
    }
  },

  info: (message, ...args) => {
    if (currentLevel >= levels.info) {
      console.log(`[INFO]  ${new Date().toISOString()} - ${message}`, ...args);
    }
  },

  debug: (message, ...args) => {
    if (currentLevel >= levels.debug) {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  },
};

module.exports = logger;
