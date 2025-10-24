// app.js
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import _express from "express";
import _bodyParser from "body-parser";
import _cors from "./config/cors.js";
import PUERTO from "./utils/constantes.js";
import api from "./routes.js";

// Cabeceras de seguridad

const app = _express();
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"],

        // === CLAVE: permitir imágenes externas ===
        // Opción estricta (solo Cloudinary + data:)
        // "img-src": ["'self'", "data:", "https://res.cloudinary.com"],

        // Opción práctica (cualquier https + data + blob)
        "img-src": ["'self'", "data:", "blob:", "https:"],

        // Si usas fetch/XHR a otro origen, agrégalo aquí:
        "connect-src": ["'self'", "http://localhost:4001"],

        "object-src": ["'none'"],
        "frame-ancestors": ["'none'"],
      },
    },
    frameguard: { action: "deny" },
    crossOriginEmbedderPolicy: false, // evita conflictos si insertas iframes/imagenes externas
  })
);


// Bloquea claves que empiecen por $ o contengan .
app.use((req, res, next) => {
  // sanitiza body y params usando el sanitizer de la lib
  if (req.body)   req.body   = mongoSanitize.sanitize(req.body,   { replaceWith: "_" });
  if (req.params) req.params = mongoSanitize.sanitize(req.params, { replaceWith: "_" });

  // para query: NO reasignamos req.query; solo mutamos sus claves
  const q = req.query;
  if (q && typeof q === "object") {
    for (const key of Object.keys(q)) {
      if (key.startsWith("$") || key.includes(".")) {
        const safe = key.replace(/\$/g, "").replace(/\./g, "_");
        // mueve el valor a la clave segura y borra la peligrosa
        q[safe] = q[key];
        delete q[key];
      }
    }
  }
  next();
});

// Rate limit (ajusta según tu caso)
const limiter = rateLimit({ windowMs: 15*60*1000, max: 300 });
app.use(limiter);
app.use(_bodyParser.json());
app.use(_bodyParser.urlencoded({ extended: true, type: "application/x-www-form-urlencoded" }));
app.use(_cors);

// estáticos
app.use(_express.static("templates"));

// Rutas API
app.use("/api/v1", api);

// Raíz
app.get("/", (req, res) => res.redirect("/login.html"));

// ⬇️ escucha solo cuando NO estés en tests
if (process.env.NODE_ENV !== "test") {
  app.listen(PUERTO, () => console.log("Listening on " + PUERTO));
}

// ⬇️ exporta la app para Supertest
export default app;
