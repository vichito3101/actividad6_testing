import * as auth from "../config/auth.js";

export const authMiddleware=function(roles=[]){
    return (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("authHeader:"+authHeader);
    console.log("roles:"+roles);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    try {
        const token = authHeader.split(' ')[1];
        const decoded = auth.verifyToken(token);
        console.log(decoded);
        if (roles.length > 0 && !roles.includes(decoded.rol)) {
            return res.status(403).json({ error: 'Permisos insuficientes' });
        }
        req.user = decoded; // Añade información del usuario al request
        next();
    } catch (error) {
        console.log('excepcion...');
        res.status(error.name=='TokenExpiredError'?401:403).json({ error: error.message });
    }
    }
};
