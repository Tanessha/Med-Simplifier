import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_for_dev";

// In-memory array for demo purposes if MongoDB is not connected
const memoryUsers = [];

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Fallback if Mongo isn't running
    if (mongoose.connection.readyState !== 1) {
      if (memoryUsers.find(u => u.username === username)) {
        return res.status(400).json({ error: "Username already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = { _id: Date.now().toString(), username, password: hashedPassword, literacyLevel: 'basic' };
      memoryUsers.push(user);
      const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "1d" });
      return res.status(201).json({ token, user: { id: user._id, username: user.username, literacyLevel: user.literacyLevel } });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: "1d" });
    res.status(201).json({ token, user: { id: newUser._id, username: newUser.username, literacyLevel: newUser.literacyLevel } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (mongoose.connection.readyState !== 1) {
      const user = memoryUsers.find(u => u.username === username);
      if (!user) return res.status(400).json({ error: "Invalid credentials" });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
      const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "1d" });
      return res.json({ token, user: { id: user._id, username: user.username, literacyLevel: user.literacyLevel } });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: { id: user._id, username: user.username, literacyLevel: user.literacyLevel } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/update-literacy", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });
    
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const { literacyLevel } = req.body;
    
    if (mongoose.connection.readyState !== 1) {
      const user = memoryUsers.find(u => u._id === decoded.id);
      if (user) user.literacyLevel = literacyLevel;
      return res.json({ user: { id: decoded.id, username: decoded.username, literacyLevel } });
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id, 
      { literacyLevel }, 
      { new: true }
    );
    
    res.json({ user: { id: updatedUser._id, username: updatedUser.username, literacyLevel: updatedUser.literacyLevel } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
