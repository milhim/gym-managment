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

// Health check endpoint (always available)
app.get('/api/v1/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        dbConnected: isConnected
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

// Test endpoint to verify routes are working
app.get('/api/v1/test', (req, res) => {
    res.json({
        success: true,
        message: 'Test endpoint working',
        timestamp: new Date().toISOString()
    });
});

// Setup API routes immediately when module loads
console.log('Setting up API routes at module load...');

try {
    // Import dependencies
    console.log('Importing dependencies...');
    const MongoMemberRepository = require('../src/infrastructure/repositories/MongoMemberRepository');
    const MembershipService = require('../src/domain/services/MembershipService');

    // Use Cases
    console.log('Importing use cases...');
    const CreateMember = require('../src/application/use-cases/CreateMember');
    const UpdateMember = require('../src/application/use-cases/UpdateMember');
    const GetMembers = require('../src/application/use-cases/GetMembers');
    const AddPayment = require('../src/application/use-cases/AddPayment');
    const DeleteMember = require('../src/application/use-cases/DeleteMember');
    const GetStatistics = require('../src/application/use-cases/GetStatistics');

    // Controllers
    console.log('Importing controllers...');
    const MemberController = require('../src/presentation/controllers/MemberController');
    const ExportController = require('../src/presentation/controllers/ExportController');

    // Validation middleware
    console.log('Importing validation middleware...');
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
    console.log('Initializing dependencies...');
    const memberRepository = new MongoMemberRepository();
    const membershipService = new MembershipService(memberRepository);

    // Initialize use cases
    console.log('Initializing use cases...');
    const createMember = new CreateMember(memberRepository, membershipService);
    const updateMember = new UpdateMember(memberRepository, membershipService);
    const getMembers = new GetMembers(memberRepository);
    const addPayment = new AddPayment(memberRepository, membershipService);
    const deleteMember = new DeleteMember(memberRepository);
    const getStatistics = new GetStatistics(memberRepository, membershipService);

    // Initialize controllers
    console.log('Initializing controllers...');
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
    console.log('Creating API router...');
    const apiRouter = express.Router();

    // Statistics endpoint
    console.log('Setting up statistics endpoint...');
    apiRouter.get('/statistics', (req, res) => {
        console.log('Statistics endpoint called');
        memberController.getStatistics(req, res);
    });

    // Export endpoints
    console.log('Setting up export endpoints...');
    apiRouter.get('/export/members', (req, res) => {
        console.log('Export members endpoint called');
        exportController.exportMembers(req, res);
    });

    // Member routes
    console.log('Setting up member routes...');
    const memberRouter = express.Router();

    // Get all members with pagination and filtering
    memberRouter.get('/',
        validateQuery(querySchema),
        (req, res) => {
            console.log('Get all members endpoint called');
            memberController.getAll(req, res);
        }
    );

    // Get member by ID
    memberRouter.get('/:id',
        validateParams(paramsSchema),
        (req, res) => {
            console.log('Get member by ID endpoint called');
            memberController.getById(req, res);
        }
    );

    // Create new member
    memberRouter.post('/',
        validateBody(memberSchema),
        (req, res) => {
            console.log('Create member endpoint called');
            memberController.create(req, res);
        }
    );

    // Update member
    memberRouter.put('/:id',
        validateParams(paramsSchema),
        validateBody(updateMemberSchema),
        (req, res) => {
            console.log('Update member endpoint called');
            memberController.update(req, res);
        }
    );

    // Delete member
    memberRouter.delete('/:id',
        validateParams(paramsSchema),
        (req, res) => {
            console.log('Delete member endpoint called');
            memberController.delete(req, res);
        }
    );

    // Add payment to member
    memberRouter.post('/:id/payments',
        validateParams(paramsSchema),
        validateBody(paymentSchema),
        (req, res) => {
            console.log('Add payment endpoint called');
            memberController.addPayment(req, res);
        }
    );

    // Get payment history for member
    memberRouter.get('/:id/payments',
        validateParams(paramsSchema),
        async (req, res) => {
            console.log('Get payment history endpoint called');
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
    console.log('Mounting member routes...');
    apiRouter.use('/members', memberRouter);

    // Mount API routes
    console.log('Mounting API routes...');
    app.use('/api/v1', apiRouter);

    console.log('API routes loaded successfully at module load');
} catch (error) {
    console.error('Failed to load API routes during module load:', error);
}

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);

    // Don't send response if already sent
    if (res.headersSent) {
        return next(error);
    }

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
    console.log(`404 handler called for: ${req.method} ${req.originalUrl}`);
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

        // Connect to database (only database connection is async now)
        await connectToDatabase();

        // Handle the request (routes are already set up)
        return app(req, res);

    } catch (error) {
        console.error('Serverless function error:', error);

        // Try to send error response
        try {
            if (res && !res.headersSent) {
                return res.status(500).json({
                    success: false,
                    error: 'Internal server error',
                    message: error.message,
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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