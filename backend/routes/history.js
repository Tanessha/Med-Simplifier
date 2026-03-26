import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import ScanHistory from "../models/ScanHistory.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_for_dev";
const memoryHistory = [];

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

router.post("/", verifyToken, async (req, res) => {
  try {
    const { originalText, simplifiedText, literacyLevel } = req.body;
    
    if (mongoose.connection.readyState !== 1) {
      const history = {
        _id: Date.now().toString(),
        userId: req.user.id,
        originalText,
        simplifiedText,
        literacyLevel,
        createdAt: new Date()
      };
      memoryHistory.push(history);
      return res.status(201).json(history);
    }

    const history = new ScanHistory({
      userId: req.user.id,
      originalText,
      simplifiedText,
      literacyLevel
    });
    await history.save();
    res.status(201).json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const history = memoryHistory.filter(h => h.userId === req.user.id).sort((a, b) => b.createdAt - a.createdAt);
      return res.json(history);
    }

    const history = await ScanHistory.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
