const express = require('express');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Infrastructure
const databaseConnection = require('../src/infrastructure/database/connection');

// Create Express app
const app = express();

// Basic middleware
app.use(compression());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Database connection state
let isConnected = false;

// Connect to database
async function connectToDatabase() {
    if (!isConnected) {
        try {
            await databaseConnection.connect();
            isConnected = true;
            console.log('Database connected successfully');
        } catch (error) {
            console.error('Database connection failed:', error);
            isConnected = false;
            throw error;
        }
    }
}

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

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

// Load and setup API routes only when needed
let routesSetup = false;

function setupApiRoutes() {
    if (!routesSetup) {
        try {
            const container = require('../src/infrastructure/container');
            const createApiRoutes = require('../src/presentation/routes/apiRoutes');

            const controllers = container.getControllers();
            app.use('/api/v1', createApiRoutes(controllers));

            routesSetup = true;
            console.log('API routes loaded successfully');
        } catch (error) {
            console.error('Failed to load API routes:', error);
            throw error;
        }
    }
}

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

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Serverless function handler
module.exports = async (req, res) => {
    try {
        console.log('Serverless function invoked:', req.method, req.url);

        // Connect to database
        await connectToDatabase();

        // Setup API routes if not already done
        setupApiRoutes();

        // Handle the request
        return app(req, res);

    } catch (error) {
        console.error('Serverless function error:', error);

        // Try to send error response
        try {
            if (res && !res.headersSent) {
                return res.status(500).json({
                    success: false,
                    error: 'Internal server error',
                    message: error.message
                });
            }
        } catch (responseError) {
            console.error('Error sending response:', responseError);
        }

        // Re-throw if we can't handle it
        throw error;
    }
};

// Export app for local development
module.exports.app = app; 