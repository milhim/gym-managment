const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Infrastructure
const databaseConnection = require('./infrastructure/database/connection');
const container = require('./infrastructure/container');

// Routes
const createApiRoutes = require('./presentation/routes/apiRoutes');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.controllers = container.getControllers();
    }

    async start() {
        try {
            // Connect to database
            await databaseConnection.connect();

            // Setup middleware
            this.setupMiddleware();

            // Setup routes
            this.setupRoutes();

            // Setup error handling
            this.setupErrorHandling();

            // Start server
            this.app.listen(this.port, () => {
                console.log(`🚀 Server running on port ${this.port}`);
                console.log(`🔗 API URL: http://localhost:${this.port}/api/v1`);
                console.log(`✅ Environment: ${process.env.NODE_ENV}`);
            });

        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    setupMiddleware() {
        // Compression middleware
        this.app.use(compression());

        // CORS middleware
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true
        }));

        // Logging middleware
        if (process.env.NODE_ENV !== 'production') {
            this.app.use(morgan('dev'));
        }

        // Body parsing middleware
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Static files (if needed)
        this.app.use(express.static('public'));

        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
            next();
        });
    }

    setupRoutes() {
        // Root endpoint
        this.app.get('/', (req, res) => {
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
        this.app.use('/api/v1', createApiRoutes(this.controllers));

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                error: 'Endpoint not found',
                message: `Cannot ${req.method} ${req.originalUrl}`
            });
        });
    }

    setupErrorHandling() {
        // Global error handler
        this.app.use((error, req, res, next) => {
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

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            // Close server & exit process
            process.exit(1);
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            process.exit(1);
        });

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('SIGTERM received, shutting down gracefully...');
            await databaseConnection.disconnect();
            process.exit(0);
        });

        process.on('SIGINT', async () => {
            console.log('SIGINT received, shutting down gracefully...');
            await databaseConnection.disconnect();
            process.exit(0);
        });
    }
}

// Create and start server
const server = new Server();
server.start();

module.exports = server; 