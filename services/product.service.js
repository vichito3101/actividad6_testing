import * as sProducto from "../schemas/producto.schema.js";

export const findAll = async (categoria) => {
  return sProducto.findAll(categoria);
};

export const findCategorias = async () => {
  return sProducto.findCategorias();
};
