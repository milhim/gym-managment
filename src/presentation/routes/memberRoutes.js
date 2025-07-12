const express = require('express');
const {
    memberSchema,
    updateMemberSchema,
    addPaymentSchema,
    querySchema,
    paramsSchema,
    validateBody,
    validateQuery,
    validateParams
} = require('../middleware/validation');

const createMemberRoutes = (memberController, exportController) => {
    const router = express.Router();

    // Get all members with pagination and filtering
    router.get('/',
        validateQuery(querySchema),
        (req, res) => memberController.getAll(req, res)
    );

    // Get member by ID
    router.get('/:id',
        validateParams(paramsSchema),
        (req, res) => memberController.getById(req, res)
    );

    // Create new member
    router.post('/',
        validateBody(memberSchema),
        (req, res) => memberController.create(req, res)
    );

    // Update member
    router.put('/:id',
        validateParams(paramsSchema),
        validateBody(updateMemberSchema),
        (req, res) => memberController.update(req, res)
    );

    // Delete member
    router.delete('/:id',
        validateParams(paramsSchema),
        (req, res) => memberController.delete(req, res)
    );

    // Add payment to member
    router.post('/:id/payments',
        validateParams(paramsSchema),
        validateBody(addPaymentSchema),
        (req, res) => memberController.addPayment(req, res)
    );

    // Get payment history for member
    router.get('/:id/payments',
        validateParams(paramsSchema),
        async (req, res) => {
            try {
                const member = await memberController.getMember.getById(req.params.id);
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

    return router;
};

module.exports = createMemberRoutes; 