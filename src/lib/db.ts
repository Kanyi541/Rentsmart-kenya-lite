'use server';

import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in the environment variables.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Function to execute a query
export async function query(sql: string, params: any[]) {
    const client = await pool.connect();
    try {
        const { rows } = await client.query(sql, params);
        return rows;
    } finally {
        client.release();
    }
}
