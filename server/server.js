require('dotenv').config();
const express = require("express");
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

  const data = await GetDbData(query, params);
  if (data.success) {
    res.json(data.data);
  } else {
    res.status(data.code).json({ message: data.message });
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
app.get("/api/v1/websites/own", async (req, res) => {
  let query = `SELECT * FROM websites WHERE public=1 AND type='own'`;
  const params = [];

  const data = await GetDbData(query, params);
  if (data.success) {
    res.json(data.data);
  } else {
    res.status(data.code).json({ message: data.message });
  }
});
app.get("/api/v1/websites/school", async (req, res) => {
  let query = `SELECT * FROM websites WHERE public=1 AND type='school'`;
  const params = [];

  const data = await GetDbData(query, params);
  if (data.success) {
    res.json(data.data);
  } else {
    res.status(data.code).json({ message: data.message });
  }
});
app.get("/api/v1/websites/:website", async (req, res) => {
  const website = req.params.website;
  let query = `SELECT * FROM websites WHERE public=1 AND file_name = ?`;
  const params = [website];

  const data = await GetDbData(query, params);
  if (data.success) {
    if (data.data.length > 0) {
      res.json({success: data.success, data: data.data[0]}); // Return the first item directly
    } else {
      res.status(404).json({ success: data.success, message: "Website not found" });
    }
  } else {
    res.status(data.code).json({ success: data.success, message: data.message });
  }
});

app.get("/api/v1/images/:type", async (req, res) => {
  const type = req.params.type;
  const basePath = path.join(__dirname, 'images', 'background', type);

  try {
    if (type === 'gif') {
      const folders = fs.readdirSync(basePath).filter(file => fs.statSync(path.join(basePath, file)).isDirectory());
      const randomFolder = folders[Math.floor(Math.random() * folders.length)];
      const folderPath = path.join(basePath, randomFolder);
      const files = fs.readdirSync(folderPath).filter(file => fs.statSync(path.join(folderPath, file)).isFile());
      const randomFile = files[Math.floor(Math.random() * files.length)];
      res.sendFile(path.join(folderPath, randomFile));
    } else if (type === 'grad') {
      const files = fs.readdirSync(basePath).filter(file => fs.statSync(path.join(basePath, file)).isFile());
      const randomFile = files[Math.floor(Math.random() * files.length)];
      res.sendFile(path.join(basePath, randomFile));
    } else {
      res.status(400).json({ message: "Invalid type" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.get("/api/v1/images/:type/:group", async (req, res) => {
  const type = req.params.type;
  const group = req.params.group;
  const basePath = path.join(__dirname, 'images', 'background', type);

  try {
    if (type === 'gif') {
      const folderPath = path.join(basePath, group);
      const files = fs.readdirSync(folderPath).filter(file => fs.statSync(path.join(folderPath, file)).isFile());
      const randomFile = files[Math.floor(Math.random() * files.length)];
      res.sendFile(path.join(folderPath, randomFile));
    } else if (type === 'grad') {
      const files = fs.readdirSync(basePath).filter(file => fs.statSync(path.join(basePath, file)).isFile());
      const randomFile = files[Math.floor(Math.random() * files.length)];
      res.sendFile(path.join(basePath, randomFile));
    } else {
      res.status(400).json({ message: "Invalid type" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.get("/api/v1/images/:type/:group/:name", async (req, res) => {
  const type = req.params.type;
  const group = req.params.group;
  const name = req.params.name;
  const basePath = path.join(__dirname, 'images', 'background', type);

  try {
    if (type === 'gif') {
      const filePath = path.join(basePath, group, `${name}.gif`);
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
      } else {
        res.status(404).json({ message: "Image not found" });
      }
    } else if (type === 'grad') {
      const filePath = path.join(basePath, `${name}.png`);
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
      } else {
        res.status(404).json({ message: "Image not found" });
      }
    } else {
      res.status(400).json({ message: "Invalid type" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

async function GetDbData(query, params = []) {
  try {
    const db = await getDb();
    const rows = await db.all(query, params);
    return {success: true, data: rows};
  } catch (error) {
    console.error(error);
    return {success: false, code: 500, message: "Internal Server Error"};
  }
}

// Handle all other routes and return the main HTML file
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});