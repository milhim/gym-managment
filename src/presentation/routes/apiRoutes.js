const express = require('express');
const createMemberRoutes = require('./memberRoutes');

const createApiRoutes = (controllers) => {
    const router = express.Router();

    // Health check endpoint
    router.get('/health', (req, res) => {
        res.json({
            success: true,
            message: 'Gym Management API is running',
            timestamp: new Date().toISOString()
        });
    });

    // Statistics endpoint
    router.get('/statistics', (req, res) => {
        controllers.memberController.getStatistics(req, res);
    });

    // Export endpoints
    router.get('/export/members', (req, res) => {
        controllers.exportController.exportMembers(req, res);
    });

    // Member routes
    router.use('/members', createMemberRoutes(
        controllers.memberController,
        controllers.exportController
    ));

    return router;
};

module.exports = createApiRoutes; 