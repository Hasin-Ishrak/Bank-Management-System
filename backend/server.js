const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middlewares
app.use(cors()); // Permits cross-origin requests from our Next.js frontend later
app.use(express.json()); // Parses incoming json requests
app.use(morgan('dev')); // Logger middleware for cleanly tracking incoming API requests

// Routes Mapping
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);

// Simple root status indicator endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Banking Management System API is fully operational' });
});

// Start Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is executing on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});