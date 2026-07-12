require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Config
const validateEnv = require('./config/env');
validateEnv();

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const callRoutes = require('./routes/callRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Middleware
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ----------------------------------------------------------------
// Security Headers — Per 13_SECURITY_POLICY.md section 12
// ----------------------------------------------------------------
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ----------------------------------------------------------------
// CORS — Per 13_SECURITY_POLICY.md section 13
// Allow only trusted frontend origins.
// ----------------------------------------------------------------
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.) in development
      if (!origin && process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS policy violation. Origin not allowed: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ----------------------------------------------------------------
// Request Logging
// ----------------------------------------------------------------
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ----------------------------------------------------------------
// Body Parsers & Static Files
// ----------------------------------------------------------------
app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ----------------------------------------------------------------
// Global Rate Limiter — Per 13_SECURITY_POLICY.md section 11
// ----------------------------------------------------------------
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    error: { code: 'RATE_LIMIT' },
  },
});
app.use('/api/', globalRateLimiter);

// ----------------------------------------------------------------
// Health Check
// ----------------------------------------------------------------
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PrivateConnect API is running.',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------------------
// API Routes — versioned /api/v1
// ----------------------------------------------------------------
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/call', callRoutes);
app.use('/api/v1/admin', adminRoutes);

// ----------------------------------------------------------------
// 404 Handler for undefined routes
// ----------------------------------------------------------------
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
    error: { code: 'NOT_FOUND' },
  });
});

// ----------------------------------------------------------------
// Global Error Handler — must be last
// ----------------------------------------------------------------
app.use(errorHandler);

module.exports = app;
