const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const Entry = require("./models/result");
const authRoutes = require("./routes/auth");

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5501",
    "http://localhost:5501"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/SoulScript")
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("DB Connection Error:", err);
  });

mongoose.connection.once("open", () => {
  console.log("Connected to database:", mongoose.connection.name);
});

// Authentication Middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "No token"
    });
  }

  try {
    const decoded = jwt.verify(token, "SOULSCRIPT_SECRET");

    req.userId = decoded.userId;

    next();
  } catch {
    res.status(401).json({
      message: "Invalid token"
    });
  }
}

// Auth Routes
app.use("/api/auth", authRoutes);

// Submit Route
app.post("/api/submit", authMiddleware, async (req, res) => {
  try {
    const {
      mood,
      energy,
      questions,
      journalEntry,
      score,
      sentimentScore
    } = req.body;

    const entry = new Entry({
      userId: req.userId,
      mood,
      energy,
      questions,
      journalEntry,
      score,
      sentimentScore: sentimentScore || 0.5
    });

    await entry.save();

    res.json({
      message: "Data saved successfully",
      data: entry
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

// History Routes
app.get("/api/history/all", authMiddleware, async (req, res) => {
  try {
    const entries = await Entry.find({
      userId: req.userId
    }).sort({
      createdAt: -1
    });

    res.json(entries);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Start Server
const PORT = 5050;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});