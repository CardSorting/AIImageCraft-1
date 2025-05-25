/**
 * PostgreSQL Credit Repository Implementation
 * Data access layer implementing ICreditRepository with PostgreSQL
 */

import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import { ICreditRepository } from '../../domain/repositories/ICreditRepository';
import { Credit, CreditBalance, CreditTransaction, CreditPackage } from '../../domain/entities/Credit';

export class PostgresCreditRepository implements ICreditRepository {
  constructor(private pool: Pool) {}

  async getCreditBalance(userId: number): Promise<Credit | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT user_id, amount, last_updated, version FROM credit_balances WHERE user_id = $1',
        [userId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return Credit.fromData({
        userId: row.user_id,
        amount: parseFloat(row.amount),
        lastUpdated: row.last_updated,
        version: row.version
      });
    } finally {
      client.release();
    }
  }

  async saveCreditBalance(credit: Credit): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        `INSERT INTO credit_balances (user_id, amount, last_updated, version) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO UPDATE SET
         amount = $2, last_updated = $3, version = $4`,
        [credit.userId, credit.amount, credit.lastUpdated, credit.version]
      );
    } finally {
      client.release();
    }
  }

  async updateCreditBalance(credit: Credit, expectedVersion: number): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `UPDATE credit_balances 
         SET amount = $1, last_updated = $2, version = $3
         WHERE user_id = $4 AND version = $5`,
        [credit.amount, credit.lastUpdated, credit.version, credit.userId, expectedVersion]
      );
      
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  }

  async recordTransaction(transaction: Omit<CreditTransaction, 'id' | 'createdAt'>): Promise<CreditTransaction> {
    const client = await this.pool.connect();
    try {
      const id = nanoid();
      const createdAt = new Date();
      
      await client.query(
        `INSERT INTO credit_transactions 
         (id, user_id, type, amount, description, metadata, created_at, balance_after)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          id,
          transaction.userId,
          transaction.type,
          transaction.amount,
          transaction.description,
          JSON.stringify(transaction.metadata || {}),
          createdAt,
          transaction.balanceAfter
        ]
      );
      
      return {
        id,
        createdAt,
        ...transaction
      };
    } finally {
      client.release();
    }
  }

  async getTransactionHistory(userId: number, limit: number = 50, offset: number = 0): Promise<CreditTransaction[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT id, user_id, type, amount, description, metadata, created_at, balance_after
         FROM credit_transactions 
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        type: row.type,
        amount: parseFloat(row.amount),
        description: row.description,
        metadata: JSON.parse(row.metadata || '{}'),
        createdAt: row.created_at,
        balanceAfter: parseFloat(row.balance_after)
      }));
    } finally {
      client.release();
    }
  }

  async getTransactionById(transactionId: string): Promise<CreditTransaction | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT id, user_id, type, amount, description, metadata, created_at, balance_after
         FROM credit_transactions 
         WHERE id = $1`,
        [transactionId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        type: row.type,
        amount: parseFloat(row.amount),
        description: row.description,
        metadata: JSON.parse(row.metadata || '{}'),
        createdAt: row.created_at,
        balanceAfter: parseFloat(row.balance_after)
      };
    } finally {
      client.release();
    }
  }

  async getCreditPackages(): Promise<CreditPackage[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT id, name, credits, price, bonus_credits, is_active, display_order, metadata
         FROM credit_packages 
         WHERE is_active = true
         ORDER BY display_order ASC`
      );
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        credits: row.credits,
        price: parseFloat(row.price),
        bonusCredits: row.bonus_credits,
        isActive: row.is_active,
        displayOrder: row.display_order,
        metadata: JSON.parse(row.metadata || '{}')
      }));
    } finally {
      client.release();
    }
  }

  async getCreditPackageById(packageId: string): Promise<CreditPackage | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT id, name, credits, price, bonus_credits, is_active, display_order, metadata
         FROM credit_packages 
         WHERE id = $1 AND is_active = true`,
        [packageId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        credits: row.credits,
        price: parseFloat(row.price),
        bonusCredits: row.bonus_credits,
        isActive: row.is_active,
        displayOrder: row.display_order,
        metadata: JSON.parse(row.metadata || '{}')
      };
    } finally {
      client.release();
    }
  }

  async executeAtomicCreditOperation<T>(operation: () => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await operation();
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}