
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

const orderRoutes = require("./routes/orderRoutes");

app.use("/api/orders", orderRoutes);

const PORT = 5000;

async function startServer() {
  try {
    console.log("Step 1: Starting database connection...");

    await connectDB();

    console.log("Step 2: Database connection completed.");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database error:", error);
    process.exitCode = 1;
  }
}

// Start server only when running this file directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
