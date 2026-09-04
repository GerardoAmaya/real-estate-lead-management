import { MongoMemoryServer } from 'mongodb-memory-server';

// Una sola instancia en memoria para toda la suite: sin Docker ni Mongo local.
export default async function globalSetup(): Promise<void> {
  const mongo = await MongoMemoryServer.create();
  (globalThis as { __MONGO__?: MongoMemoryServer }).__MONGO__ = mongo;
  process.env.MONGODB_URI = mongo.getUri('test_db');
}
