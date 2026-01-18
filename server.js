// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");

// const gameRoutes = require("./routes/gameRoutes"); // Game routes
// const authRoutes = require("./routes/authRoutes"); // Auth routes
// const friendRequestRoutes = require("./routes/friendRoutes"); // Friend request routes
// const userRoutes = require("./routes/userRoutes");

// const { verifyToken } = require("./middleware/authMiddleware");

import express from "express";
import cors from "cors";
import "dotenv/config";

import gameRoutes from "./routes/gameRoutes.js"; // Game routes
import authRoutes from "./routes/authRoutes.js"; // Auth routes
import friendRequestRoutes from "./routes/friendRoutes.js"; // Friend request routes
import userRoutes from "./routes/userRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Để đọc body request jsonn

app.use("/api/games", gameRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/friend-requests", friendRequestRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("chạy ok");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
