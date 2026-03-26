import mongoose from "mongoose";

const scanHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalText: { type: String, required: true },
  simplifiedText: { type: String, required: true },
  literacyLevel: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ScanHistory", scanHistorySchema);
