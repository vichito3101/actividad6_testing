import { Router } from "express";
import * as productoController from "../controllers/producto.controller.js";

const router = Router();

router.get("/", productoController.findAll);
router.get("/categorias", productoController.categorias);

export default router;
