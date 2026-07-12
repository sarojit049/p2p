/**
 * Environment Variable Validation
 * Fail fast on startup if required variables are missing.
 */

const requiredVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
];

const validateEnv = () => {
  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('Please check your .env file against .env.example');
    process.exit(1);
  }

  console.log('✅ Environment variables validated.');
};

module.exports = validateEnv;
