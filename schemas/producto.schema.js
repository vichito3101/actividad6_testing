// servidor/schemas/producto.schema.js
import odm from "../config/mongoose.js"; 

const productoSchema = new odm.Schema(
  {
    nombre: { type: String, required: true, index: "text" },
    categoria: { type: String, required: true },
    precio: { type: Number, required: true },
    stock: { type: Number, required: true },
    marca: { type: String },
    unidad: { type: String },
    activo: { type: Boolean, default: true },
    // NUEVO:
    imagenUrl: { type: String, default: "" },
  },
  { collection: "producto", versionKey: "version" }
);

export const Producto = odm.model("producto", productoSchema);

// === Servicios (en este mismo archivo, como ya tenías) ===
export const findAll = async function (categoriaRaw) {
  const query = { activo: { $ne: false } };

  if (categoriaRaw && categoriaRaw.trim() && categoriaRaw !== "Todas") {
    const categoria = categoriaRaw.trim();
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.categoria = new RegExp(`^${esc(categoria)}$`, "i");
  }

  return Producto.find(query).sort({ nombre: 1 });
};

export const findCategorias = async function () {
  return Producto.distinct("categoria", { activo: { $ne: false } });
};
