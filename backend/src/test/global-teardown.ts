import type { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalTeardown(): Promise<void> {
  const mongo = (globalThis as { __MONGO__?: MongoMemoryServer }).__MONGO__;
  await mongo?.stop();
}
