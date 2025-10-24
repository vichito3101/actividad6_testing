import request from "supertest";
import app from "../../app.js";
import { connectInMemory, clearDatabase, closeInMemory } from "../utils/mongo-memory.js";
import { Persona } from "../../schemas/persona.schema.js";

beforeAll(connectInMemory);
afterAll(closeInMemory);
afterEach(clearDatabase);

test("login válido → 200", async () => {
  await Persona.create({
    nombre:"CR7", apellido:"CR7", nro_documento:"99999999", edad:39,
    tipo_documento:{ id_tipodoc:1, nombre:"dni" },
    usuario:{ email:"cr7@gmail.com", password:"1234", rol:"admin" }
  });
  const res = await request(app)
    .post("/api/v1/seguridad/login")
    .send({ email:"cr7@gmail.com", password:"1234" });
  expect(res.statusCode).toBe(200);
  expect(res.body.token).toBeDefined();
});
test('400 si faltan credenciales', async () => {
  const r = await request(app).post('/api/v1/seguridad/login').send({});
  expect(r.status).toBe(400);
});

test('403 si usuario no existe', async () => {
  const r = await request(app).post('/api/v1/seguridad/login')
    .send({ email: 'x@x.com', password: '1234' });
  expect(r.status).toBe(403);
});

test('403 si password no coincide', async () => {
  await Persona.create({
    nombre:'N', apellido:'A', nro_documento:'11111111', edad:20,
    tipo_documento:{id_tipodoc:1, nombre:'dni'},
    usuario:{ email:'u@x.com', password:'ok', rol:'admin' }
  });
 const r = await request(app).post('/api/v1/seguridad/login')
  .send({ email:'u@x.com', password:'bad1' }); // >= 4
  expect(r.status).toBe(403);
});


test('refresh-token 401 si falta', async () => {
  const r = await request(app).post('/api/v1/seguridad/refresh-token').send({});
  expect(r.status).toBe(401);
});
test('login 400 si faltan campos', async () => {
  const r = await request(app).post('/api/v1/seguridad/login').send({ email: '' });
  expect(r.status).toBe(400);
});

test('refresh 401 sin token', async () => {
  const r = await request(app).post('/api/v1/seguridad/refresh-token').send({});
  expect(r.status).toBe(401);
});
