const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    
    if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        return res.status(400).json({
            success: false,
            message: errorMessage
        });
    }
    
    next();
};

const schemas = {
    register: Joi.object({
        name: Joi.string().required().min(2).max(50),
        email: Joi.string().email().required(),
        password: Joi.string().required().min(6),
        phone: Joi.string().required().length(10).pattern(/^[0-9]+$/),
        otp: Joi.string().required().length(6)
    }),
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),
    sendOTP: Joi.object({
        email: Joi.string().email().required()
    }),
    forgotPassword: Joi.object({
        email: Joi.string().email().required()
    }),
    resetPassword: Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string().required().length(6),
        password: Joi.string().required().min(6)
    }),
    updateDetails: Joi.object({
        name: Joi.string().min(2).max(50),
        profilePic: Joi.string().uri().allow('', null),
        exam: Joi.string().allow('', null),
        class: Joi.string().allow('', null),
        stream: Joi.string().allow('', null),
        city: Joi.string().allow('', null),
        state: Joi.string().allow('', null)
    })
};

module.exports = { validate, schemas };
