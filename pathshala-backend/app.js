const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const parentRoutes = require('./routes/parentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const academicRoutes = require('./routes/academicRoutes');

const app = express();

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
    max: 500,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});

app.use('/api', limiter);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/academic', academicRoutes);

// Root Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'Healthy',
        timestamp: new Date().toISOString()
    });
});

// Error Handling Middleware
const errorHandler = require('./middleware/errorhandler');
app.use(errorHandler);

module.exports = app;