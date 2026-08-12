require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const seedInitialData = require('./utils/seedData');

const PORT = process.env.PORT || 5000;

// Database Connection
connectDB()
    .then(() => {
        seedInitialData();
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