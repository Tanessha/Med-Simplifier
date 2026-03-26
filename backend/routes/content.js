import express from "express";
import multer from "multer";
import path from "path";
import mongoose from "mongoose";
import File from "../models/File.js";
import { processFileContent, processUrlContent, analyzeText, rewriteText, buildMedicalNotes, summarizeUploadedMedicalContent, buildMedicalNotesFromFile, summarizeUploadedMedicalFile } from "../services/processor.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const memoryFiles = []; // Fallback if MongoDB is offline

router.post("/upload", upload.single("file"), body("literacyLevel").optional().isString().trim().escape(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const { literacyLevel } = req.body;
    const result = await processFileContent(req.file, literacyLevel);
    const sourceType = req.file.mimetype.startsWith("image/") ? "image" : "document";
    const canUseDirectAi = req.file.mimetype.startsWith("image/") || req.file.mimetype === "application/pdf";
    const directOptions = {
      sourceType,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
    };
    const directNotes = canUseDirectAi ? await buildMedicalNotesFromFile(req.file.path, directOptions) : "";
    const notes = directNotes || await buildMedicalNotes(result.text, sourceType);
    const directSummary = canUseDirectAi && !notes
      ? await summarizeUploadedMedicalFile(req.file.path, literacyLevel || "basic", directOptions)
      : "";
    const rewritten =
      directSummary ||
      await summarizeUploadedMedicalContent(notes || result.text, literacyLevel || "basic", directOptions);
    
    // In-memory fallback
    if (mongoose.connection.readyState !== 1) {
      const fileDoc = { _id: Date.now().toString(), originalName: req.file.originalname, filename: req.file.filename, path: req.file.path, mimetype: req.file.mimetype, size: req.file.size, processedText: result.text, readabilityScore: result.score, literacyLevel: result.level, notes, rewritten };
      memoryFiles.push(fileDoc);
      return res.json(fileDoc);
    }
    
    const fileDoc = await File.create({
      originalName: req.file.originalname, filename: req.file.filename, path: req.file.path, mimetype: req.file.mimetype, size: req.file.size, processedText: result.text, readabilityScore: result.score, literacyLevel: result.level
    });
    res.json({ ...fileDoc.toObject(), notes, rewritten });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/url", body("url").isURL().trim(), body("literacyLevel").optional().isString().trim().escape(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { url, literacyLevel } = req.body;
    const result = await processUrlContent(url, literacyLevel);
    const notes = await buildMedicalNotes(result.text, "url");
    const rewritten = await rewriteText(result.text, literacyLevel || "basic", {
      sourceType: "url",
      requireMeaningfulChange: true,
    });
    res.json({ ...result, notes, rewritten });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/analyze", body("text").isString().trim().notEmpty(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { text } = req.body;
    const result = analyzeText(text);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/rewrite", body("text").isString().trim().notEmpty(), body("targetLevel").isString().trim().notEmpty(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { text, targetLevel } = req.body;
    const rewritten = await rewriteText(text, targetLevel);
    res.json({ rewritten });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
