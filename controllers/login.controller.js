import { Persona } from "../schemas/persona.schema.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos vacíos
    if (!email || !password) {
      return res.status(400).json({ mensaje: "Correo y contraseña son obligatorios." });
    }

    // Buscar usuario por email
    const user = await Persona.findOne({ "usuario.email": email });
    if (!user) {
      return res.status(401).json({ mensaje: "Usuario no encontrado." });
    }

    // Comparar contraseñas (simple; en proyectos reales usar bcrypt)
    if (user.usuario.password !== password) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta." });
    }

    // Si todo está correcto, redirigir a productos
    res.status(200).json({ mensaje: "✅ Login exitoso", redirect: "/productos.html" });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};
