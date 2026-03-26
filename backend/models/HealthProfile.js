import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, default: "Report", trim: true },
    provider: { type: String, default: "", trim: true },
    reportDate: { type: String, default: "" },
    summary: { type: String, default: "", trim: true },
    status: { type: String, default: "available", trim: true },
  },
  { _id: true }
);

const prescriptionSchema = new mongoose.Schema(
  {
    medication: { type: String, required: true, trim: true },
    dosage: { type: String, default: "", trim: true },
    frequency: { type: String, default: "", trim: true },
    instructions: { type: String, default: "", trim: true },
    prescribedOn: { type: String, default: "" },
    refillDate: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { _id: true }
);

const appointmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    doctor: { type: String, default: "", trim: true },
    specialty: { type: String, default: "", trim: true },
    appointmentDate: { type: String, default: "" },
    location: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },
    reminderEnabled: { type: Boolean, default: true },
    reminderLeadDays: { type: Number, default: 2 },
    status: { type: String, default: "scheduled", trim: true },
  },
  { _id: true }
);

const reminderSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    dueDate: { type: String, default: "" },
    type: { type: String, default: "general", trim: true },
    notes: { type: String, default: "", trim: true },
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const healthProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    medicalHistory: { type: String, default: "" },
    allergies: { type: String, default: "" },
    conditions: { type: String, default: "" },
    emergencyContact: { type: String, default: "" },
    reports: { type: [reportSchema], default: [] },
    prescriptions: { type: [prescriptionSchema], default: [] },
    appointments: { type: [appointmentSchema], default: [] },
    reminders: { type: [reminderSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("HealthProfile", healthProfileSchema);
