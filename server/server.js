const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const { initializeSocket } = require('./sockets/socketManager');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Create HTTP server from Express app
  const server = http.createServer(app);

  // Attach Socket.io
  const io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Initialize Socket.io manager, get public API
  const socketManager = initializeSocket(io);

  // Make io and socketManager available to controllers via app.locals
  app.locals.io = io;
  app.locals.socketManager = socketManager;

  // Start listening
  server.listen(PORT, () => {
    logger.info(`🚀 PrivateConnect Server running on port ${PORT}`);
    logger.info(`   Environment: ${process.env.NODE_ENV}`);
    logger.info(`   API Base:    http://localhost:${PORT}/api/v1`);
    logger.info(`   Health:      http://localhost:${PORT}/health`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise} reason: ${reason}`);
    server.close(() => process.exit(1));
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      logger.info('Server closed.');
      process.exit(0);
    });
  });
};

startServer();
