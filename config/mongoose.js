import _mongoose from "mongoose";
_mongoose.set("strictQuery", true); 
const DEFAULT_URI = process.env.MONGO_URI || "mongodb://localhost:27017/bdprueba";
let isConnected = false;

export async function connect(uri = DEFAULT_URI) {
  if (isConnected) return _mongoose;
  await _mongoose.connect(uri);
  isConnected = true;
  return _mongoose;
}

export async function disconnect() {
  if (!isConnected) return;
  await _mongoose.connection.close();
  isConnected = false;
}

_mongoose.connection.on("connected", () => console.log("Mongoose conectado"));
_mongoose.connection.on("error", (err) => console.error("Error en Mongoose:", err));
_mongoose.connection.on("disconnected", () => console.log("Mongoose desconectado"));

// ⬇️ Solo autoconecta en runtime normal, no en tests
if (process.env.NODE_ENV !== "test") {
  connect().then(() => console.log("Conectado a MongoDB")).catch(console.error);
}

export default _mongoose;
