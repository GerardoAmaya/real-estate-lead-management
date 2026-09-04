import type { Server } from 'node:http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase, disconnectDatabase } from './config/database';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const server: Server = app.listen(env.PORT, () => {
    logger.info(`API escuchando en http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });

  // Apagado ordenado: deja de aceptar conexiones y cierra Mongo antes de salir.
  const shutdown = (signal: string) => {
    return () => {
      logger.info(`${signal} recibido, cerrando la aplicacion`);
      server.close(() => {
        void disconnectDatabase().then(() => {
          logger.info('Cierre completado');
          process.exit(0);
        });
      });
      // Salida forzada si algo queda colgado.
      setTimeout(() => process.exit(1), 10_000).unref();
    };
  };

  process.on('SIGTERM', shutdown('SIGTERM'));
  process.on('SIGINT', shutdown('SIGINT'));
}

bootstrap().catch((error: unknown) => {
  logger.fatal({ err: error }, 'No fue posible iniciar la aplicacion');
  process.exit(1);
});
