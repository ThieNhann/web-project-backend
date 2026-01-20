import express from "express";
import cors from "cors";
import "dotenv/config";
import swaggerUi from "swagger-ui-express";

import authRoutes from "./routes/authRoutes.js"; // Auth routes
import adminRoutes from "./routes/adminRoutes.js"; // Admin routes
import usersRoutes from "./routes/usersRoutes.js"; // User routes
import profileRoutes from "./routes/profileRoutes.js";
import friendRequestRoutes from "./routes/friendRoutes.js"; // Friend request routes
import gameRoutes from "./routes/gameRoutes.js"; // Game routes
import searchRoutes from "./routes/searchRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import userStatsRoutes from "./routes/userStatsRoutes.js";
import { verifyApiKey } from "./middleware/apiKeyMiddleware.js";
import { specs } from "./config/swagger.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Để đọc body request jsonn

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/api/auth", authRoutes);

app.use("/api/admin",  adminRoutes);

app.use("/api/users", usersRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/friend-requests", friendRequestRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/user-stats", userStatsRoutes);

app.get("/", (req, res) => {
  res.send("chạy ok");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
