const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'mentalpsique'}`;

const pool = new Pool({
  connectionString,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.DB_POOL_MAX || '10', 10),
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida');
    client.release();
  } catch (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
    process.exit(1);
  }
}

// Helper to support mysql2-style `?` placeholders and return shape similar to mysql2
function replacePlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
}

async function execute(sql, params = []) {
  const text = replacePlaceholders(sql);
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    // Mimic mysql2 response: [rows, result]
    const rows = res.rows;
    const result = { affectedRows: res.rowCount };

    // If it was an INSERT without RETURNING, obtain lastval
    if (/^\s*INSERT\s+/i.test(sql) && res.rowCount > 0) {
      try {
        const seq = await client.query("SELECT LASTVAL() AS id");
        result.insertId = seq.rows[0] ? seq.rows[0].id : null;
      } catch (_) {
        result.insertId = null;
      }
    }

    return [rows, result];
  } finally {
    client.release();
  }
}

// Attach execute to pool for compatibility with existing code that uses pool.execute
pool.execute = execute;

module.exports = { pool, testConnection, execute };
