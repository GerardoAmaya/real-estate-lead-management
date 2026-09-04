import mongoose from 'mongoose';
import { isDatabaseConnected } from '../../config/database';

export interface HealthStatus {
  status: 'ok' | 'degraded';
  uptime: number;
  timestamp: string;
  database: { connected: boolean; state: string };
}

const STATES: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

// Verifica la conexion real con un ping, no solo el estado del driver.
export async function getHealthStatus(): Promise<HealthStatus> {
  let connected = isDatabaseConnected();

  if (connected) {
    try {
      await mongoose.connection.db?.admin().ping();
    } catch {
      connected = false;
    }
  }

  return {
    status: connected ? 'ok' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: { connected, state: STATES[mongoose.connection.readyState] ?? 'unknown' },
  };
}
