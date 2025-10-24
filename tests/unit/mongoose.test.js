import mongoose from '../../config/mongoose.js';

test('emite disconnected', () => {
  mongoose.connection.emit('disconnected');
  // no falla => línea ejecutada
});
