// servidor/schemas/persona.schema.js
import odm from "../config/mongoose.js";
import bcrypt from "bcrypt";

const personaSchema = new odm.Schema(
  {
    nombre:        { type: String, required: true, trim: true },
    apellido:      { type: String, trim: true },

    // ✅ ÚNICO desde el path (no usar schema.index para el mismo key)
    nro_documento: { type: String, required: true, trim: true, unique: true },

    // No requerido, con default (evita 400 en creates)
    edad:          { type: Number, default: 18, min: 0, max: 120 },

    // Legacy (compatibilidad)
    correo:   { type: String, trim: true, lowercase: true, select: false },
    password: { type: String, select: false },

    tipo_documento: {
      id_tipodoc: { type: Number, default: 1 },
      nombre:     { type: String, default: "dni", trim: true },
    },

    usuario: {
      // ✅ ÚNICO desde el path (no usar schema.index para el mismo key)
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
        select: false, // no sale salvo con +usuario.password
      },
      rol: {
        type: String,
        lowercase: true,
        trim: true,
        enum: ["admin", "cliente"],
        default: "cliente",
      },
    },

    fecha_registro: { type: Date, default: Date.now },
  },
  { collection: "persona", versionKey: "version" }
);

/* Virtual de conveniencia */
personaSchema.virtual("nombre_completo").get(function () {
  return `${this.nombre ?? ""} ${this.apellido ?? ""}`.trim();
});

/* Normalización + hash de password cuando cambia */
personaSchema.pre("save", async function (next) {
  if (this.isModified("nombre") && this.nombre)
    this.nombre = this.nombre.toUpperCase();

  if (this.isModified("apellido") && this.apellido)
    this.apellido = this.apellido.toUpperCase();

  if (this.isModified("usuario.rol") && this.usuario?.rol)
    this.usuario.rol = this.usuario.rol.toLowerCase();

  // Hash solo si usuario.password cambió y aún no está hasheado
  if (this.isModified("usuario.password") && this.usuario?.password) {
    const pwd = this.usuario.password;
    const seemsHashed = /^\$2[aby]\$/.test(pwd);
    if (!seemsHashed) {
      this.usuario.password = await bcrypt.hash(pwd, 12);
    }
  }

  next();
});

/* Comparar password; funciona si el doc fue cargado con +usuario.password */
personaSchema.methods.comparePassword = async function (plain) {
  if (typeof this.usuario?.password === "string") {
    const stored = this.usuario.password;
    if (/^\$2[aby]\$/.test(stored)) return bcrypt.compare(plain, stored);
    return stored === plain; // (por compatibilidad si alguna vez se guardó plano)
  }
  if (typeof this.password === "string") {
    const stored = this.password;
    if (/^\$2[aby]\$/.test(stored)) return bcrypt.compare(plain, stored);
    return stored === plain;
  }
  return false;
};

export const Persona = odm.model("persona", personaSchema);

/* ====== Consultas/Helpers (misma API que tenías) ====== */
export const findAll = async () => {
  // Devuelve array (tu controller lo trata como lista)
  return Persona.find({});
};

export const findOneForLogin = async (email) => {
  // Incluye password explícitamente para comparePassword()
  return Persona.findOne({ "usuario.email": String(email || "").toLowerCase().trim() })
               .select("+usuario.password");
};

export const login = async (objUsuario) => {
  return Persona.find({ "usuario.email": String(objUsuario?.email || "").toLowerCase().trim() });
};

// Se mantiene el comportamiento de devolver array (tu refreshToken usa usuarios[0])
export const findById = async (id_persona) => {
  return Persona.find({ _id: id_persona });
};

export const create = async (objUsuario) => {
  // Pre-save hook se encarga de hashear usuario.password si no lo está
  return Persona.create(objUsuario);
};

export const update = async (id_persona, objUsuario) => {
  // Trae el doc con password para permitir re-hash si lo actualizas
  const doc = await Persona.findById(id_persona).select("+usuario.password");
  if (!doc) return null;

  if (objUsuario.nombre != null)  doc.nombre  = objUsuario.nombre;
  if (objUsuario.apellido != null) doc.apellido = objUsuario.apellido;
  if (objUsuario.edad != null)     doc.edad     = objUsuario.edad;

  if (objUsuario.usuario?.password) doc.usuario.password = objUsuario.usuario.password;
  if (objUsuario.usuario?.rol)      doc.usuario.rol      = objUsuario.usuario.rol;

  await doc.save(); // dispara el pre('save') para re-hash si cambió password
  return doc;
};
