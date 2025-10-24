import * as sseguridad from "../services/seguridad.service.js";
import * as auth from "../config/auth.js";

export const findAll = async function(req, res) {
    console.log("------------controller------------");
   
    try{
        const usuarios = await sseguridad.findAll();
        res.json(usuarios || []);
    }catch(error){
        console.log(error);
        res.status(500).json({"error":"Error obteniendo registros"});
    }
}

export const findById = async function(req, res) {
    console.log("------------controller------------");
   
    try{

        const id_persona= req.params.id;
        const usuarios = await sseguridad.findById(id_persona);
        res.json(usuarios || []);
    }catch(error){
        console.log(error);
        res.status(500).json({"error":"Error obteniendo registros"});
    }
}

 
export const login = async function (req, res) {
  console.log("------------controller------------");
  const { email, correo, password } = req.body;
  const normalizedEmail = String(email || correo || "").trim().toLowerCase();

  try {
    if (!normalizedEmail || !password) {
      return res
        .status(400)
        .json({ error: "Correo y contraseña son obligatorios" });
    }

    // Trae 1 usuario incluyendo password (select:false)
    const user = await sseguridad.findOneForLogin(normalizedEmail);
    if (!user) {
      return res.status(403).json({ error: "Acceso no autorizado" });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(403).json({ error: "Acceso no autorizado" });
    }

    const payload = {
      id_persona: String(user._id),
      email: user.usuario.email,
      rol: user.usuario.rol,
    };

    const token = auth.generateToken(payload);
    const refreshToken = auth.generateRefreshToken({ id_persona: payload.id_persona });

    return res.json({
      token,
      refreshToken,
      user: payload,
      redirect: "/productos.html",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error obteniendo registros" });
  }
};



export const refreshToken = function(req, res) {
    console.log("------------controller------------");
    const {refreshToken}=req.body;
    console.log(refreshToken);

    if (!refreshToken){
        return res.status(401).json({"error":"Refresh token requerido"});
    }

    try{
        const decoded = auth.verifyRefreshToken(refreshToken);
        console.log(decoded);
    
        sseguridad.findById(decoded.id_persona)
        .then(usuarios => {
            
            if(usuarios[0]){
                
                let token=auth.generateToken(usuarios[0]);
                console.log("token: "+token);
                res.json( { token, 
                        "user":{"id_persona":usuarios[0]._id, "email":usuarios[0].usuario.email, "rol":usuarios[0].usuario.rol}
                        } );
            }
            else
                res.status(403).json( {"error":"Acceso no autorizado"} );
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({"error":"Error obteniendo registros"});
        });
        
    }catch(error){
        console.log('excepcion...');
        res.status(error.name=='TokenExpiredError'?401:403).json({ error: error.message });
    }
};


export const create = async function(req, res) {
  console.log("------------controller (create)------------");
  try {
    const { nombre, apellido, nro_documento, edad, email, password, rol } = req.body;

    if (!nombre || !apellido || !nro_documento || !edad || !email || !password) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // normalizar
    const payload = {
      nombre: String(nombre).trim(),
      apellido: String(apellido).trim(),
      nro_documento: String(nro_documento).trim(),
      edad: Number(edad),
      tipo_documento: { id_tipodoc: 1, nombre: "dni" },
      usuario: {
        email: String(email).trim().toLowerCase(),
        password: String(password),
        rol: (rol || "cliente").toLowerCase()
      },
      fecha_registro: new Date()
    };

    // verificación de duplicados (email o nro_documento)
    const existentes = await sseguridad.findAll();
    if (existentes.some(p => p.nro_documento === payload.nro_documento ||
                             p.usuario?.email === payload.usuario.email)) {
      return res.status(409).json({ error: "Ya existe un usuario con ese email o nro_documento" });
    }

    const creado = await sseguridad.create(payload);
    return res.status(201).json({ ok: true, id: creado._id });
  } catch (err) {
    console.error(err);

    
    if (err?.code === 11000) {
      return res.status(409).json({ error: "Duplicado: email o nro_documento ya existe" });
    }
    return res.status(500).json({ error: "Error ingresando registros" });
  }
};


export const update = async function(req, res) {
    console.log("------------controller------------");
   
    try{
        const id_persona= req.params.id;
        const objUsuario= req.body;
        console.log(id_persona);
        console.log(objUsuario);
        const usuarios = await sseguridad.update(id_persona, objUsuario);
        res.json(usuarios || {});
    }catch(error){
        console.log(error);
        res.status(500).json({"error":"Error ingresando registros"});
    }
}

export const findEdadPromedio = async function(req, res) {
    console.log("------------controller------------");
    try{
        const edadMinima= req.body.edadMinima;
        console.log(edadMinima);
        const usuarios = await sseguridad.findEdadPromedio(edadMinima);
        res.json(usuarios || []);
    }catch(error){
        console.log(error);
        res.status(500).json({"error":"Error obteniendo registros"});
    }
}

