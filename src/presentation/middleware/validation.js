const Joi = require('joi');

const memberSchema = Joi.object({
    personalInfo: Joi.object({
        firstName: Joi.string().required().trim().min(2).max(50),
        lastName: Joi.string().required().trim().min(2).max(50),
        phone: Joi.string().required().trim().pattern(/^[\d\s\-\+\(\)]+$/).min(8).max(20),
        email: Joi.string().optional().email().trim().lowercase(),
        dateOfBirth: Joi.date().optional().max('now'),
        gender: Joi.string().optional().valid('male', 'female'),
        emergencyContact: Joi.object({
            name: Joi.string().optional().trim().min(2).max(50),
            phone: Joi.string().optional().trim().pattern(/^[\d\s\-\+\(\)]+$/).min(8).max(20)
        }).optional()
    }).required(),
    membership: Joi.object({
        joinDate: Joi.date().optional().default(new Date()),
        totalFee: Joi.number().required().min(0),
        paidAmount: Joi.number().optional().min(0).default(0),
        status: Joi.string().optional().valid('active', 'inactive', 'suspended').default('active'),
        notes: Joi.string().optional().allow('')
    }).required(),
    initialPaymentMethod: Joi.string().optional().valid('cash', 'card', 'transfer').default('cash')
});

const updateMemberSchema = Joi.object({
    personalInfo: Joi.object({
        firstName: Joi.string().optional().trim().min(2).max(50),
        lastName: Joi.string().optional().trim().min(2).max(50),
        phone: Joi.string().optional().trim().pattern(/^[\d\s\-\+\(\)]+$/).min(8).max(20),
        email: Joi.string().optional().email().trim().lowercase(),
        dateOfBirth: Joi.date().optional().max('now'),
        gender: Joi.string().optional().valid('male', 'female'),
        emergencyContact: Joi.object({
            name: Joi.string().optional().trim().min(2).max(50),
            phone: Joi.string().optional().trim().pattern(/^[\d\s\-\+\(\)]+$/).min(8).max(20)
        }).optional()
    }).optional(),
    membership: Joi.object({
        joinDate: Joi.date().optional(),
        totalFee: Joi.number().optional().min(0),
        paidAmount: Joi.number().optional().min(0),
        status: Joi.string().optional().valid('active', 'inactive', 'suspended'),
        notes: Joi.string().optional().allow('')
    }).optional()
});

const paymentSchema = Joi.object({
    amount: Joi.number().required().min(0.01),
    date: Joi.date().optional().default(new Date()),
    method: Joi.string().required().valid('cash', 'card', 'transfer'),
    notes: Joi.string().optional().allow('')
});

const querySchema = Joi.object({
    page: Joi.number().optional().integer().min(1).default(1),
    limit: Joi.number().optional().integer().min(1).max(100).default(10),
    search: Joi.string().optional().trim().min(1).max(50),
    status: Joi.string().optional().valid('active', 'inactive', 'suspended', 'paid', 'unpaid', 'partial'),
    joinDateFrom: Joi.date().optional(),
    joinDateTo: Joi.date().optional()
});

const validateBody = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors
            });
        }

        req.body = value;
        next();
    };
};

const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                error: 'Query validation failed',
                details: errors
            });
        }

        req.query = value;
        next();
    };
};

const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                error: 'Parameter validation failed',
                details: errors
            });
        }

        req.params = value;
        next();
    };
};

const paramsSchema = Joi.object({
    id: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).messages({
        'string.pattern.base': 'Invalid ID format'
    })
});

module.exports = {
    memberSchema,
    updateMemberSchema,
    paymentSchema,
    querySchema,
    paramsSchema,
    validateBody,
    validateQuery,
    validateParams
}; 