import _express from "express";
import rseguridad from "./routes/seguridad.routes.js";
import productoRoutes from "./routes/producto.routes.js";
const router= _express.Router();

//... secciones ...
router.use('/seguridad', rseguridad);
router.use("/productos", productoRoutes); 

export default router;
