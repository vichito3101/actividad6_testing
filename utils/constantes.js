const PUERTO=4001;
export const FRONTEND_URL='http://localhost:3000';

//export const JWT_SECRET='PUCPBackend2025';
//export const JWT_SECRET='f67654cfd723b3990b173ed651b21703cd11b710b8cc843effd665eeacb19a21'
export const JWT_SECRET=process.env.JWT_SECRET;
export const JWT_EXPIRES='1h';

//export const JWT_REFRESH_SECRET='PUCPBackend2025REFRESH';
//export const JWT_REFRESH_SECRET='045f6addd6c1588922117b1ca54500e17188cba3929114a4d91633ef0a88be22'
export const JWT_REFRESH_SECRET=process.env.JWT_REFRESH_SECRET
export const JWT_REFRESH_EXPIRES='10h';

export default PUERTO;
