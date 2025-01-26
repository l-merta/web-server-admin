require('dotenv').config();
const express = require("express");
const cors = require('cors');
//const { getCloudflaredConfig } = require('./commands');
const { connectToDatabase, getDb, closeDatabase, refreshDatabaseConnection } = require("./db");

const app = express();
const PORT = process.env.PORT || 5200;

// Use CORS middleware
app.use(cors());

// Serve static files from React
app.use(express.static("public"));

// Database connection
connectToDatabase();

// Refresh database connection every 30 minutes
setInterval(refreshDatabaseConnection, 0.5 * 60 * 60 * 1000);

// API route that returns JSON object
app.get("/api/v1", (req, res) => {
  res.json({ "api": "Hello World" });
});

app.get("/api/v1/websites", async (req, res) => {
  let query = `SELECT * FROM websites WHERE public=1`;
  const params = [];

  try {
    const db = await getDb();
    const rows = await db.all(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
  /*
  getCloudflaredConfig((error, data) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ config: data });
  });
  */
});

// Handle all other routes and return the main HTML file
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});