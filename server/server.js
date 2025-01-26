require('dotenv').config();
const express = require("express");
const cors = require('cors');
const { getCloudflaredConfig } = require('./commands');

const app = express();
const PORT = process.env.PORT || 5200;

// Use CORS middleware
app.use(cors());

// Serve static files from React
app.use(express.static("public"));

// API route that returns JSON object
app.get("/api/v1", (req, res) => {
  res.json({ "api": "Hello World" });
});

app.get("/api/v1/websites", (req, res) => {
  getCloudflaredConfig((error, data) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ config: data });
  });
});

// Handle all other routes and return the main HTML file
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});