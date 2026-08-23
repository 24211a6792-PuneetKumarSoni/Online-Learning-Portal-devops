require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Database Connection
connectDB()
    .then(() => {
        console.log('Database connected successfully. No mock data seeded.');
    })
    .catch((err) => {
        console.error('Database connection failed:', err);
    });

// Start Server
const server = app.listen(PORT, () => {
    console.log(
        `Pathshala Enterprise Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
});

// Graceful Unhandled Rejection Handling
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Error: ${err.message}`);

    server.close(() => {
        process.exit(1);
    });
});