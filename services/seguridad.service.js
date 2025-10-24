// servidor/services/seguridad.service.js
import { Persona, findOneForLogin as personaFindOneForLogin } from "../schemas/persona.schema.js";

/** Lista completa (orden alfabético apellidos/nombres) */
export const findAll = async () => {
  return Persona.find({}).sort({ apellido: 1, nombre: 1 });
};

/** Solo para login: devuelve doc con usuario.password incluido */
export const findOneForLogin = (email) => {
  return personaFindOneForLogin(email);
};

/** Buscar por id */
export const findById = (id_persona) => {
  return Persona.findById(id_persona);
};

/** Crear usuario */
export const create = (objUsuario) => {
  // objUsuario debe venir con: nombre, apellido, nro_documento, edad,
  // usuario: { email, password, rol }, tipo_documento, fecha_registro
  return Persona.create(objUsuario);
};

/** Actualizar usuario */
export const update = (id_persona, data) => {
  return Persona.findByIdAndUpdate(id_persona, data, { new: true });
};

