
const mysql = require("mysql2/promise");
require("dotenv").config({ quiet: true });

let pool;

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 4000),
    ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  },
};

async function connectDB() {
  // Connect to TiDB server first
  const connection = await mysql.createConnection(dbConfig);

  console.log("TiDB Cloud connected successfully");

  const dbName = process.env.DB_NAME;

  // Create database if it does not exist
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\``
  );

  await connection.end();

  // Connect to application database
  pool = mysql.createPool({
    ...dbConfig,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_name VARCHAR(100) NOT NULL,
      address TEXT NOT NULL,
      phone VARCHAR(15) NOT NULL,
      status TINYINT NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      item_name VARCHAR(100) NOT NULL,
      quantity INT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `);

  console.log("Orders and order_items tables are ready");

  return pool;
}

function getDB() {
  if (!pool) {
    throw new Error("Database is not initialized");
  }

  return pool;
}

module.exports = { connectDB, getDB };
