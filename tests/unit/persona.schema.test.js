// tests/unit/persona.schema.test.js
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Persona } from '../../schemas/persona.schema.js';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri(), { dbName: 'testdb' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Persona.deleteMany({});
});

test('pre-save: convierte nombre/apellido a upper y rol a lower', async () => {
  const p = await Persona.create({
    nombre: 'juan',
    apellido: 'perez',
    nro_documento: '12345678',
    edad: 20,
    tipo_documento: { id_tipodoc: 1, nombre: 'dni' },
    usuario: { email: 'j@x.com', password: 'x', rol: 'ADMIN' },
  });

  expect(p.nombre).toBe('JUAN');
  expect(p.apellido).toBe('PEREZ');
  expect(p.usuario.rol).toBe('admin');
  expect(p.fecha_registro).toBeInstanceOf(Date);
});

test('virtual nombre_completo', async () => {
  const p = await Persona.create({
    nombre: 'maria',
    apellido: 'lopez',
    nro_documento: '87654321',
    edad: 22,
    tipo_documento: { id_tipodoc: 1, nombre: 'dni' },
    usuario: { email: 'm@x.com', password: 'x', rol: 'cliente' },
  });

  // el hook pone en upper antes de evaluar el virtual
  expect(p.nombre_completo).toBe('MARIA LOPEZ');
});
