import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import dotenv from 'dotenv';
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';
import googleAuthRoutes from './routes/googleAuth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects', taskRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 CORS enabled for: ${corsOptions.origin.join(', ')}`);
  console.log('='.repeat(50));
  console.log('\nAvailable endpoints:');
  console.log(`  GET    /api/health              - Health check`);
  console.log(`  POST   /api/auth/register       - Register new user`);
  console.log(`  POST   /api/auth/login          - Login user`);
  console.log(`  GET    /api/auth/profile        - Get user profile (protected)`);
  console.log(`  PUT    /api/auth/profile        - Update profile (protected)`);
  console.log(`  GET    /api/projects            - Get all projects (protected)`);
  console.log(`  POST   /api/projects            - Create project (protected)`);
  console.log(`  GET    /api/projects/:id        - Get project by ID (protected)`);
  console.log(`  PUT    /api/projects/:id        - Update project (protected)`);
  console.log(`  DELETE /api/projects/:id        - Delete project (protected)`);
  console.log(`  GET    /api/projects/:id/tasks  - Get project tasks (protected)`);
  console.log(`  POST   /api/projects/:id/tasks  - Create task (protected)`);
  console.log(`  PUT    /api/projects/:id/tasks/:taskId - Update task (protected)`);
  console.log(`  DELETE /api/projects/:id/tasks/:taskId - Delete task (protected)`);
  console.log('='.repeat(50));
});

export default app;
