
'use server';

import { pool } from './db-client';

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
