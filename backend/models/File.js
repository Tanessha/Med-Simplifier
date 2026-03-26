import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  originalName: String,
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
  uploadedAt: { type: Date, default: Date.now },
  processedText: String,
  readabilityScore: Number,
  literacyLevel: String,
});

export default mongoose.model("File", FileSchema);
