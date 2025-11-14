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

// 🔹 Muy importante: Express está detrás de Nginx
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"],

        // Permitir imágenes locales, data: y externas por https
        "img-src": ["'self'", "data:", "blob:", "https:"],

        // Ahora todo pasa por el MISMO dominio (Nginx)
        "connect-src": ["'self'"],

        "object-src": ["'none'"],
        "frame-ancestors": ["'none'"],
      },
    },
    frameguard: { action: "deny" },
    crossOriginEmbedderPolicy: false,
  })
);

// Bloquea claves que empiecen por $ o contengan .
app.use((req, res, next) => {
  if (req.body)   req.body   = mongoSanitize.sanitize(req.body,   { replaceWith: "_" });
  if (req.params) req.params = mongoSanitize.sanitize(req.params, { replaceWith: "_" });

  const q = req.query;
  if (q && typeof q === "object") {
    for (const key of Object.keys(q)) {
      if (key.startsWith("$") || key.includes(".")) {
        const safe = key.replace(/\$/g, "").replace(/\./g, "_");
        q[safe] = q[key];
        delete q[key];
      }
    }
  }
  next();
});

// Rate limit (ajuste según su caso)
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use(limiter);

app.use(_bodyParser.json());
app.use(
  _bodyParser.urlencoded({
    extended: true,
    type: "application/x-www-form-urlencoded",
  })
);
app.use(_cors);

// estáticos
app.use(_express.static("templates"));

// Rutas API
app.use("/api/v1", api);

// Raíz
app.get("/", (req, res) => res.redirect("/login.html"));

// Escucha solo cuando NO esté en tests
if (process.env.NODE_ENV !== "test") {
  app.listen(PUERTO, () => console.log("Listening on " + PUERTO));
}

export default app;
