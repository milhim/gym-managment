const Joi = require('joi');

// Simple member schema with only the 4 required fields
const memberSchema = Joi.object({
    name: Joi.string().required().trim().min(2).max(100).messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name must not exceed 100 characters'
    }),
    phoneNumber: Joi.string().required().trim().pattern(/^[\d\s\-\+\(\)]+$/).min(8).max(20).messages({
        'string.empty': 'Phone number is required',
        'string.pattern.base': 'Phone number must contain only digits, spaces, dashes, plus signs, and parentheses',
        'string.min': 'Phone number must be at least 8 characters',
        'string.max': 'Phone number must not exceed 20 characters'
    }),
    joinDate: Joi.date().required().messages({
        'date.base': 'Join date must be a valid date',
        'any.required': 'Join date is required'
    }),
    paidAmount: Joi.number().required().min(0).messages({
        'number.base': 'Paid amount must be a number',
        'number.min': 'Paid amount cannot be negative',
        'any.required': 'Paid amount is required'
    })
});

const updateMemberSchema = Joi.object({
    name: Joi.string().optional().trim().min(2).max(100),
    phoneNumber: Joi.string().optional().trim().pattern(/^[\d\s\-\+\(\)]+$/).min(8).max(20),
    joinDate: Joi.date().optional(),
    paidAmount: Joi.number().optional().min(0)
});

const querySchema = Joi.object({
    page: Joi.number().optional().integer().min(1).default(1),
    limit: Joi.number().optional().integer().min(1).max(100).default(10),
    search: Joi.string().optional().trim().min(1).max(50),
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
    querySchema,
    paramsSchema,
    validateBody,
    validateQuery,
    validateParams
}; 