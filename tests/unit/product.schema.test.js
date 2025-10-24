// tests/unit/product.schema.test.js
import { MongoMemoryServer } from "mongodb-memory-server";
import odm from "../../config/mongoose.js";
import { connectInMemory, closeInMemory } from "../utils/mongo-memory.js";
import { Producto } from "../../schemas/producto.schema.js";

beforeAll(connectInMemory);
afterAll(closeInMemory);

test("crea un producto válido", async () => {
  const p = await Producto.create({
    nombre: "Aceite Primor 1L",
    categoria: "Abarrotes",
    precio: 9.9,
    stock: 20
  });
  expect(p._id).toBeDefined();
  expect(p.activo).toBe(true);
});
