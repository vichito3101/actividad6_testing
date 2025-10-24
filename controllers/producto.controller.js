import * as pservice from "../services/product.service.js";

export const findAll = async (req, res) => {
  try {
    const { categoria } = req.query;           
    const data = await pservice.findAll(categoria);
    res.json(data || []);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error obteniendo productos" });
  }
};

export const categorias = async (req, res) => {
  try {
    const cats = await pservice.findCategorias();
    res.json(cats || []);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error obteniendo categorías" });
  }
};
