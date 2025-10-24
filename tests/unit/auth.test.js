// tests/unit/auth.test.js
import * as auth from '../../config/auth.js';

test('generateToken no revienta aunque no haya JWT_SECRET (usa fallback)', () => {
  const old = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;

  const token = auth.generateToken({ id: 1 });
  expect(typeof token).toBe('string');
  expect(token.length).toBeGreaterThan(10);

  process.env.JWT_SECRET = old;
});
