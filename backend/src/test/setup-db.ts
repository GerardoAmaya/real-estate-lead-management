import mongoose from 'mongoose';

// Una conexion por archivo de test; las colecciones se limpian entre casos
// para que el orden de ejecucion nunca influya en el resultado.
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI as string);
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.connection.close();
});
