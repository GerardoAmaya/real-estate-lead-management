import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

// autoIndex siempre desactivado: los indices se crean por migracion, nunca
// al arrancar. Evita bloqueos en colecciones grandes y duplicidad de nombres.
mongoose.set('autoIndex', false);
mongoose.set('strictQuery', true);

export async function connectDatabase(uri: string = env.MONGODB_URI): Promise<void> {
  mongoose.connection.on('connected', () => logger.info('MongoDB conectado'));
  mongoose.connection.on('error', (error: Error) =>
    logger.error({ err: error }, 'Error de conexion con MongoDB'),
  );
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB desconectado'));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close();
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === mongoose.ConnectionStates.connected;
}
