import mysql from 'mysql2/promise';
import 'dotenv/config';

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to execute a query
export async function query(sql: string, params: any[]) {
  const [results, ] = await pool.execute(sql, params);
  return results;
}

export default pool;
