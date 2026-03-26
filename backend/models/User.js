import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  literacyLevel: { type: String, default: "basic" }, // This will be updated by the quiz
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
