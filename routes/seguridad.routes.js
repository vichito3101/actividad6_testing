
import _express from "express";
import * as cseguridad from "../controllers/seguridad.controller.js";
import { validate } from "../middleware/validate.js";
import { loginSchema } from "../validators/auth.validator.js";
const router = _express.Router();


router.post("/login", validate(loginSchema), cseguridad.login);
router.get("/login", (req, res) => {

  res.status(405).json({ error: "Use POST /api/v1/seguridad/login" });
});

router.post("/refresh-token", cseguridad.refreshToken);

// Listado general
router.get("/", cseguridad.findAll);



router.get("/:id", cseguridad.findById);

// Crear usuario
router.post("/create", cseguridad.create);

export default router;
