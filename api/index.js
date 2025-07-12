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
let routesSetup = false;

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

// Health check endpoint (always available)
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

// Setup API routes
async function setupApiRoutes() {
    if (!routesSetup) {
        try {
            console.log('Setting up API routes...');

            // Import dependencies
            const MongoMemberRepository = require('../src/infrastructure/repositories/MongoMemberRepository');
            const MembershipService = require('../src/domain/services/MembershipService');

            // Use Cases
            const CreateMember = require('../src/application/use-cases/CreateMember');
            const UpdateMember = require('../src/application/use-cases/UpdateMember');
            const GetMembers = require('../src/application/use-cases/GetMembers');
            const AddPayment = require('../src/application/use-cases/AddPayment');
            const DeleteMember = require('../src/application/use-cases/DeleteMember');
            const GetStatistics = require('../src/application/use-cases/GetStatistics');

            // Controllers
            const MemberController = require('../src/presentation/controllers/MemberController');
            const ExportController = require('../src/presentation/controllers/ExportController');

            // Validation middleware
            const {
                memberSchema,
                updateMemberSchema,
                paymentSchema,
                querySchema,
                paramsSchema,
                validateBody,
                validateQuery,
                validateParams
            } = require('../src/presentation/middleware/validation');

            // Initialize dependencies
            const memberRepository = new MongoMemberRepository();
            const membershipService = new MembershipService(memberRepository);

            // Initialize use cases
            const createMember = new CreateMember(memberRepository, membershipService);
            const updateMember = new UpdateMember(memberRepository, membershipService);
            const getMembers = new GetMembers(memberRepository);
            const addPayment = new AddPayment(memberRepository, membershipService);
            const deleteMember = new DeleteMember(memberRepository);
            const getStatistics = new GetStatistics(memberRepository, membershipService);

            // Initialize controllers
            const memberController = new MemberController(
                createMember,
                updateMember,
                getMembers,
                addPayment,
                deleteMember,
                getStatistics
            );
            const exportController = new ExportController(getMembers, getStatistics);

            // Create API router
            const apiRouter = express.Router();

            // Statistics endpoint
            apiRouter.get('/statistics', (req, res) => {
                memberController.getStatistics(req, res);
            });

            // Export endpoints
            apiRouter.get('/export/members', (req, res) => {
                exportController.exportMembers(req, res);
            });

            // Member routes
            const memberRouter = express.Router();

            // Get all members with pagination and filtering
            memberRouter.get('/',
                validateQuery(querySchema),
                (req, res) => memberController.getAll(req, res)
            );

            // Get member by ID
            memberRouter.get('/:id',
                validateParams(paramsSchema),
                (req, res) => memberController.getById(req, res)
            );

            // Create new member
            memberRouter.post('/',
                validateBody(memberSchema),
                (req, res) => memberController.create(req, res)
            );

            // Update member
            memberRouter.put('/:id',
                validateParams(paramsSchema),
                validateBody(updateMemberSchema),
                (req, res) => memberController.update(req, res)
            );

            // Delete member
            memberRouter.delete('/:id',
                validateParams(paramsSchema),
                (req, res) => memberController.delete(req, res)
            );

            // Add payment to member
            memberRouter.post('/:id/payments',
                validateParams(paramsSchema),
                validateBody(paymentSchema),
                (req, res) => memberController.addPayment(req, res)
            );

            // Get payment history for member
            memberRouter.get('/:id/payments',
                validateParams(paramsSchema),
                async (req, res) => {
                    try {
                        const member = await getMembers.getById(req.params.id);
                        res.json({
                            success: true,
                            data: member.paymentHistory
                        });
                    } catch (error) {
                        if (error.message === 'Member not found') {
                            return res.status(404).json({
                                success: false,
                                error: error.message
                            });
                        }
                        res.status(500).json({
                            success: false,
                            error: 'Failed to retrieve payment history'
                        });
                    }
                }
            );

            // Mount member routes
            apiRouter.use('/members', memberRouter);

            // Mount API routes
            app.use('/api/v1', apiRouter);

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

// 404 handler - MUST be after all routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Initialize routes on startup
let initializationPromise = null;

async function initialize() {
    if (!initializationPromise) {
        initializationPromise = (async () => {
            try {
                await connectToDatabase();
                await setupApiRoutes();
                console.log('API initialization completed successfully');
            } catch (error) {
                console.error('API initialization failed:', error);
                throw error;
            }
        })();
    }
    return initializationPromise;
}

// Serverless function handler
module.exports = async (req, res) => {
    try {
        console.log('Serverless function invoked:', req.method, req.url);

        // Initialize database and routes
        await initialize();

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