import mysql from 'mysql2/promise';
import 'dotenv/config';

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
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
