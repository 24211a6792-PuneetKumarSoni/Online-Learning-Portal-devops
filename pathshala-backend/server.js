const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const seedInitialData = require('./utils/seedData');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const academicRoutes = require('./routes/academicRoutes');

const app = express();

// Database Connection
connectDB().then(() => {
  seedInitialData();
});

// Security & Core Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/academic', academicRoutes);

// Root Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Healthy', timestamp: new Date().toISOString() });
});

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Pathshala Enterprise Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful Unhandled Rejection Handling
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Error: ${err.message}`);
  server.close(() => process.exit(1));
});