const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Infrastructure
const databaseConnection = require('../src/infrastructure/database/connection');
const container = require('../src/infrastructure/container');

// Routes
const createApiRoutes = require('../src/presentation/routes/apiRoutes');

// Create Express app
const app = express();

// Connect to database (only once)
let isConnected = false;

async function connectToDatabase() {
    if (!isConnected) {
        try {
            await databaseConnection.connect();
            isConnected = true;
            console.log('Database connected successfully');
        } catch (error) {
            console.error('Database connection failed:', error);
            throw error;
        }
    }
}

// Setup middleware
function setupMiddleware() {
    // Compression middleware
    app.use(compression());

    // CORS middleware
    app.use(cors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
    }));

    // Logging middleware
    if (process.env.NODE_ENV !== 'production') {
        app.use(morgan('dev'));
    }

    // Body parsing middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
        next();
    });
}

// Setup routes
function setupRoutes() {
    const controllers = container.getControllers();

    // Root endpoint
    app.get('/', (req, res) => {
        res.json({
            success: true,
            message: 'Gym Management API',
            version: '1.0.0',
            endpoints: {
                health: '/api/v1/health',
                members: '/api/v1/members',
                statistics: '/api/v1/statistics',
                export: '/api/v1/export/members'
            }
        });
    });

    // API routes
    app.use('/api/v1', createApiRoutes(controllers));

    // 404 handler
    app.use('*', (req, res) => {
        res.status(404).json({
            success: false,
            error: 'Endpoint not found',
            message: `Cannot ${req.method} ${req.originalUrl}`
        });
    });
}

// Setup error handling
function setupErrorHandling() {
    // Global error handler
    app.use((error, req, res, next) => {
        console.error('Global error handler:', error);

        // Mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: Object.values(error.errors).map(e => e.message)
            });
        }

        // MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                error: 'Duplicate entry',
                message: 'A record with this information already exists'
            });
        }

        // MongoDB cast error
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
        }

        // Default error response
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'production'
                ? 'Something went wrong'
                : error.message
        });
    });
}

// Initialize app
setupMiddleware();
setupRoutes();
setupErrorHandling();

// Serverless function handler
module.exports = async (req, res) => {
    try {
        await connectToDatabase();
        return app(req, res);
    } catch (error) {
        console.error('Serverless function error:', error);
        return res.status(500).json({
            success: false,
            error: 'Database connection failed'
        });
    }
};

// Export app for local development
module.exports.app = app; 