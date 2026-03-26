
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import contentRoutes from "./routes/content.js";
import authRoutes from "./routes/auth.js";
import historyRoutes from "./routes/history.js";
import profileRoutes from "./routes/profile.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8082;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/scan-scribe", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api", contentRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend running" });
});

app.listen(PORT, () => {
  console.log('========================================');
  console.log(`🚀 Backend server is running on port ${PORT}`);
  console.log('========================================');
});
