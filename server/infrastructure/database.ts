import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import memoizee from 'memoizee';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Enterprise-grade connection pool configuration
const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  // Connection pool optimization
  max: 20, // Maximum pool size
  min: 5,  // Minimum pool size for connection reuse
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Connection timeout 5s
  // Statement timeout for long-running queries
  statement_timeout: 10000, // 10 seconds
};

export const pool = new Pool(connectionConfig);

// Database instance with prepared statements
export const db = drizzle({ 
  client: pool, 
  schema,
  logger: process.env.NODE_ENV === 'development'
});

// Connection health monitoring
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnections(): Promise<void> {
  try {
    await pool.end();
    console.log('Database connections closed gracefully');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
}

// Query result caching for frequently accessed data
export const createMemoizedQuery = <T extends any[], R>(
  queryFn: (...args: T) => Promise<R>,
  options: {
    maxAge?: number;
    max?: number;
    primitive?: boolean;
  } = {}
) => {
  return memoizee(queryFn, {
    maxAge: options.maxAge || 300000, // 5 minutes default
    max: options.max || 100, // Cache up to 100 results
    primitive: options.primitive || false,
    promise: true,
    ...options
  });
};

// Process cleanup handlers
process.on('SIGTERM', closeDatabaseConnections);
process.on('SIGINT', closeDatabaseConnections);
process.on('beforeExit', closeDatabaseConnections);