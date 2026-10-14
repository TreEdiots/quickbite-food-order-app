
const mysql = require("mysql2/promise");
require("dotenv").config({ quiet: true });

let pool;

async function connectDB() {
  // Connect to MySQL server first
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    port: Number(process.env.DB_PORT || 3306),
  });

   console.log("MySQL connected successfully");

  // Create database if it does not exist
  
  // Create database if it does not exist
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || "food_order_db"}\``
  );

  await connection.end();

  // Connect to the application database
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "food_order_db",
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
  });

  // Create orders table if it does not exist
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

console.log("Order items table is ready");

  return pool;
}

function getDB() {
  if (!pool) {
    throw new Error("Database is not initialized");
  }

  return pool;
}

module.exports = { connectDB, getDB };