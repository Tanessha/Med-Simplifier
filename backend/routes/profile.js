import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import HealthProfile from "../models/HealthProfile.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_for_dev";
const memoryProfiles = [];

const defaultProfile = (userId) => ({
  userId,
  medicalHistory: "",
  allergies: "",
  conditions: "",
  emergencyContact: "",
  reports: [],
  prescriptions: [],
  appointments: [],
  reminders: [],
});

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

router.get("/", verifyToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      let profile = memoryProfiles.find((item) => item.userId === req.user.id);
      if (!profile) {
        profile = defaultProfile(req.user.id);
        memoryProfiles.push(profile);
      }
      return res.json(profile);
    }

    let profile = await HealthProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = await HealthProfile.create(defaultProfile(req.user.id));
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/", verifyToken, async (req, res) => {
  try {
    const payload = {
      medicalHistory: req.body.medicalHistory || "",
      allergies: req.body.allergies || "",
      conditions: req.body.conditions || "",
      emergencyContact: req.body.emergencyContact || "",
      reports: Array.isArray(req.body.reports) ? req.body.reports : [],
      prescriptions: Array.isArray(req.body.prescriptions) ? req.body.prescriptions : [],
      appointments: Array.isArray(req.body.appointments) ? req.body.appointments : [],
      reminders: Array.isArray(req.body.reminders) ? req.body.reminders : [],
    };

    if (mongoose.connection.readyState !== 1) {
      const index = memoryProfiles.findIndex((item) => item.userId === req.user.id);
      const profile = { ...(index >= 0 ? memoryProfiles[index] : defaultProfile(req.user.id)), ...payload, userId: req.user.id };
      if (index >= 0) {
        memoryProfiles[index] = profile;
      } else {
        memoryProfiles.push(profile);
      }
      return res.json(profile);
    }

    const profile = await HealthProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: payload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
