// tests/integration/productos.test.js
import { jest } from '@jest/globals';
import request from 'supertest';

// 1) Mock del service ANTES de importarlo
jest.unstable_mockModule('../../services/product.service.js', () => ({
  // mocks por defecto para el resto de tests del archivo
  findAll: jest.fn().mockResolvedValue([
    { nombre: 'Arroz', categoria: 'Abarrotes', precio: 10, stock: 5 },
  ]),
  findCategorias: jest.fn().mockResolvedValue(['Abarrotes', 'Bebidas']),
}));

// 2) Importa el app y el service DESPUÉS del mock
const { default: app } = await import('../../app.js');
const pservice = await import('../../services/product.service.js');

describe('Productos API', () => {
  test('GET /api/v1/productos 200 con data', async () => {
    const r = await request(app).get('/api/v1/productos');
    expect(r.status).toBe(200);
    expect(Array.isArray(r.body)).toBe(true);
  });

  test('GET /api/v1/productos 500 si service falla', async () => {
    // cambia el comportamiento solo para este test
    pservice.findAll.mockRejectedValueOnce(new Error('boom'));
    const r = await request(app).get('/api/v1/productos');
    expect(r.status).toBe(500);
    expect(r.body.error).toMatch(/error obteniendo/i);
  });

  test('GET /api/v1/productos/categorias 200', async () => {
    const r = await request(app).get('/api/v1/productos/categorias');
    expect(r.status).toBe(200);
    expect(r.body).toContain('Abarrotes');
  });
});
