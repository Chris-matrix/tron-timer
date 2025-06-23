import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import process from 'process';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Security middleware
app.use(helmet());
app.disable('x-powered-by');

// Enable CORS in development
if (!isProduction) {
  app.use(cors());
}

// Logging
app.use(morgan(isProduction ? 'combined' : 'dev'));

// Trust first proxy (for Heroku, etc.)
app.set('trust proxy', 1);

// Static files configuration
const staticOptions = {
  maxAge: isProduction ? '1y' : 0,
  immutable: true,
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
};

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist'), staticOptions));

// Compression (handled by reverse proxy in production)
if (!isProduction) {
  const compression = await import('compression').then(m => m.default);
  app.use(compression());
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Handle all other routes by serving the index.html file
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'), {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running in ${isProduction ? 'production' : 'development'} mode`);
  console.log(`Listening on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

// Handle shutdown gracefully
const shutdown = () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server has been stopped');
    process.exit(0);
  });

  // Force close server after 5 seconds
  setTimeout(() => {
    console.error('Forcing server shutdown');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, you might want to send this to an error tracking service
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // In production, you might want to send this to an error tracking service
  process.exit(1);
});

// Export the server for testing
export { app, server };
