import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string().min(4).max(128).required()
});

export const createUserSchema = Joi.object({
  nombre: Joi.string().min(1).max(60).required(),
  apellido: Joi.string().min(1).max(60).required(),
  nro_documento: Joi.string().pattern(/^\d{8,12}$/).required(),
  edad: Joi.number().integer().min(0).max(120).required(),
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string().min(4).max(128).required(),
  rol: Joi.string().valid("admin","cliente").required()
});
