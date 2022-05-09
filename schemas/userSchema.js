import Joi from "joi";

const loginSchema = Joi.object({
    email: Joi.string().pattern(/.*@.*/).required(),
    password: Joi.string().required(),
});

export {
    loginSchema
}