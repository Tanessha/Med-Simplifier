import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bell, CalendarClock, FileText, Pill, Plus, Trash2 } from "lucide-react";
import { emptyHealthProfile, getHealthProfile, getScanHistory, saveHealthProfile } from "@/lib/firestoreData";

const emptyProfile = emptyHealthProfile;

const formatDate = (value) => {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const daysUntil = (value) => {
  if (!value) return null;
  const now = new Date();
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;
  return Math.round((target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / 86400000);
};

const fieldClassName = "bg-black/30 border-white/15 text-white placeholder:text-slate-400";
const dateFieldClassName = `${fieldClassName} [color-scheme:dark]`;
const panelClassName = "bg-white/8 border-white/15";

const Dashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [reportForm, setReportForm] = useState({ title: "", provider: "", reportDate: "", summary: "" });
  const [prescriptionForm, setPrescriptionForm] = useState({ medication: "", dosage: "", frequency: "", refillDate: "" });
  const [appointmentForm, setAppointmentForm] = useState({ title: "", doctor: "", appointmentDate: "", location: "", reminderLeadDays: 2 });
  const [reminderForm, setReminderForm] = useState({ title: "", dueDate: "", notes: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const [historyData, profileData] = await Promise.all([
          getScanHistory(user.id),
          getHealthProfile(user.id),
        ]);
        setHistory(historyData);
        setProfile({ ...emptyProfile, ...profileData });
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
    else setLoading(false);
  }, [user]);

  const reminders = useMemo(() => {
    const appointments = (profile.appointments || []).map((item) => ({
      id: item._id || item.id,
      title: item.title,
      date: item.appointmentDate,
      detail: `${item.doctor || "Doctor"}${item.location ? ` - ${item.location}` : ""}`,
      daysLeft: daysUntil(item.appointmentDate),
      source: "Appointment",
    }));
    const custom = (profile.reminders || []).map((item) => ({
      id: item._id || item.id,
      title: item.title,
      date: item.dueDate,
      detail: item.notes || "Reminder",
      daysLeft: daysUntil(item.dueDate),
      source: "Reminder",
    }));
    return [...appointments, ...custom]
      .filter((item) => item.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, [profile]);

  const saveProfile = async () => {
    try {
      setSaving(true);
      await saveHealthProfile(user.id, profile);
      toast.success("Dashboard saved");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addItem = (key, value, reset) => {
    const primary = Object.values(value)[0];
    if (!String(primary || "").trim()) {
      toast.error("Please fill the main field first");
      return;
    }
    setProfile((current) => ({
      ...current,
      [key]: [{ ...value, id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }, ...(current[key] || [])],
    }));
    reset();
  };

  const removeItem = (key, id) => {
    setProfile((current) => ({
      ...current,
      [key]: current[key].filter((item) => (item._id || item.id) !== id),
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="p-8 text-center">Please log in to view your dashboard.</div>
      </div>
    );
  }

  const menuItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "medical-history", label: "Medical History", icon: "📋" },
    { id: "records", label: "Records", icon: "📁" },
    { id: "appointments", label: "Appointments & Reminders", icon: "📅" },
    { id: "scans", label: "Scan History", icon: "📄" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
          {/* Left Sidebar */}
          <div className="space-y-2">
            <Card className={`${panelClassName} lg:sticky lg:top-24`}>
              <CardContent className="p-4 space-y-2">
                <div className="font-bold text-white mb-4">Dashboard</div>
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                      activeTab === item.id
                        ? "bg-blue-500/20 border border-blue-500/50 text-white font-medium"
                        : "bg-transparent border border-white/10 text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Content */}
          <div className="space-y-6">
            {/* Header */}
            <Card className={panelClassName}>
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <Badge className="mb-3 bg-emerald-500/15 text-emerald-300 border-emerald-400/20">Personalized dashboard</Badge>
                  <h1 className="text-3xl font-bold text-white">Hello, {user.username}</h1>
                  <p className="text-slate-100 mt-2">Track reports, prescriptions, appointments, reminders, and medical history in one place.</p>
                </div>
                <Button onClick={saveProfile} disabled={saving} className="bg-blue-500 text-white">
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </CardContent>
            </Card>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: "Reports", value: profile.reports.length, icon: FileText },
                    { label: "Prescriptions", value: profile.prescriptions.length, icon: Pill },
                    { label: "Appointments", value: profile.appointments.length, icon: CalendarClock },
                    { label: "Scans", value: history.length, icon: FileText },
                  ].map((item) => (
                    <Card key={item.label} className={panelClassName}>
                      <CardContent className="p-5 flex justify-between items-center">
                        <div>
                          <p className="text-slate-100 text-sm font-medium">{item.label}</p>
                          <p className="text-3xl font-semibold mt-1 text-white">{item.value}</p>
                        </div>
                        <item.icon className="w-6 h-6 text-sky-300" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
                  <Card className={panelClassName}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white"><Bell className="w-5 h-5 text-amber-300" /> Upcoming reminders</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {loading ? <p className="text-slate-200">Loading...</p> : reminders.length === 0 ? <p className="text-slate-100">No reminders yet.</p> : reminders.map((item) => (
                        <div key={`${item.source}-${item.id}`} className="p-4 rounded-xl border border-white/15 bg-black/25 flex justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-blue-500/15 text-blue-300 border-blue-400/20">{item.source}</Badge>
                              <span className="text-xs text-slate-200">{item.daysLeft === null ? "Date pending" : `${item.daysLeft} day(s) left`}</span>
                            </div>
                            <p className="font-semibold text-white">{item.title}</p>
                            <p className="text-sm text-slate-100">{item.detail}</p>
                          </div>
                          <span className="text-sm text-slate-100">{formatDate(item.date)}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className={panelClassName}>
                    <CardHeader><CardTitle className="text-white">Health snapshot</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-4 rounded-xl border border-white/15 bg-black/25"><p className="text-xs text-slate-100 mb-1 font-medium">Conditions</p><p className="text-slate-50">{profile.conditions || "No conditions added yet."}</p></div>
                      <div className="p-4 rounded-xl border border-white/15 bg-black/25"><p className="text-xs text-slate-100 mb-1 font-medium">Allergies</p><p className="text-slate-50">{profile.allergies || "No allergies added yet."}</p></div>
                      <div className="p-4 rounded-xl border border-white/15 bg-black/25"><p className="text-xs text-slate-100 mb-1 font-medium">Emergency contact</p><p className="text-slate-50">{profile.emergencyContact || "No emergency contact added yet."}</p></div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Medical History Tab */}
            {activeTab === "medical-history" && (
              <Card className={panelClassName}>
                <CardHeader><CardTitle className="text-white">Medical history</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <Textarea value={profile.conditions} onChange={(e) => setProfile((c) => ({ ...c, conditions: e.target.value }))} className={`${fieldClassName} min-h-28`} placeholder="Known conditions" />
                  <Textarea value={profile.allergies} onChange={(e) => setProfile((c) => ({ ...c, allergies: e.target.value }))} className={`${fieldClassName} min-h-28`} placeholder="Allergies" />
                  <Textarea value={profile.medicalHistory} onChange={(e) => setProfile((c) => ({ ...c, medicalHistory: e.target.value }))} className={`${fieldClassName} min-h-36 md:col-span-2`} placeholder="Surgeries, prior diagnoses, hospital visits, family history..." />
                  <Input value={profile.emergencyContact} onChange={(e) => setProfile((c) => ({ ...c, emergencyContact: e.target.value }))} className={`${fieldClassName} md:col-span-2`} placeholder="Emergency contact" />
                </CardContent>
              </Card>
            )}

            {/* Records Tab */}
            {activeTab === "records" && (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className={panelClassName}>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Plus className="w-4 h-4 text-sky-300" /> Add report</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <Input value={reportForm.title} onChange={(e) => setReportForm((c) => ({ ...c, title: e.target.value }))} className={fieldClassName} placeholder="Report title" />
                    <Input value={reportForm.provider} onChange={(e) => setReportForm((c) => ({ ...c, provider: e.target.value }))} className={fieldClassName} placeholder="Provider" />
                    <Input type="date" value={reportForm.reportDate} onChange={(e) => setReportForm((c) => ({ ...c, reportDate: e.target.value }))} className={dateFieldClassName} />
                    <Textarea value={reportForm.summary} onChange={(e) => setReportForm((c) => ({ ...c, summary: e.target.value }))} className={`${fieldClassName} min-h-24`} placeholder="Summary" />
                    <Button onClick={() => addItem("reports", reportForm, () => setReportForm({ title: "", provider: "", reportDate: "", summary: "" }))} className="w-full bg-blue-500 text-white">Add report</Button>
                  </CardContent>
                </Card>

                <Card className={panelClassName}>
                  <CardHeader><CardTitle className="text-white">Add prescription</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <Input value={prescriptionForm.medication} onChange={(e) => setPrescriptionForm((c) => ({ ...c, medication: e.target.value }))} className={fieldClassName} placeholder="Medication" />
                    <Input value={prescriptionForm.dosage} onChange={(e) => setPrescriptionForm((c) => ({ ...c, dosage: e.target.value }))} className={fieldClassName} placeholder="Dosage" />
                    <Input value={prescriptionForm.frequency} onChange={(e) => setPrescriptionForm((c) => ({ ...c, frequency: e.target.value }))} className={fieldClassName} placeholder="Frequency" />
                    <Input type="date" value={prescriptionForm.refillDate} onChange={(e) => setPrescriptionForm((c) => ({ ...c, refillDate: e.target.value }))} className={dateFieldClassName} />
                    <Button onClick={() => addItem("prescriptions", prescriptionForm, () => setPrescriptionForm({ medication: "", dosage: "", frequency: "", refillDate: "" }))} className="w-full bg-emerald-500 text-white">Add prescription</Button>
                  </CardContent>
                </Card>

                <Card className={panelClassName}>
                  <CardHeader><CardTitle className="text-white">Saved reports</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {(profile.reports || []).length === 0 ? <p className="text-slate-100">No reports saved yet.</p> : profile.reports.map((item) => (
                      <div key={item._id || item.id} className="p-4 rounded-xl border border-white/15 bg-black/25 flex justify-between gap-4">
                        <div><p className="font-semibold text-white">{item.title}</p><p className="text-sm text-slate-100">{item.provider || "Provider not set"} - {formatDate(item.reportDate)}</p><p className="text-sm text-slate-50 mt-2">{item.summary || "No summary added."}</p></div>
                        <Button variant="ghost" size="icon" onClick={() => removeItem("reports", item._id || item.id)} className="text-slate-200 hover:text-white"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className={panelClassName}>
                  <CardHeader><CardTitle className="text-white">Saved prescriptions</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {(profile.prescriptions || []).length === 0 ? <p className="text-slate-100">No prescriptions saved yet.</p> : profile.prescriptions.map((item) => (
                      <div key={item._id || item.id} className="p-4 rounded-xl border border-white/15 bg-black/25 flex justify-between gap-4">
                        <div><p className="font-semibold text-white">{item.medication}</p><p className="text-sm text-slate-100">{item.dosage || "Dosage not set"} - {item.frequency || "Frequency not set"}</p><p className="text-sm text-slate-50 mt-2">Refill: {formatDate(item.refillDate)}</p></div>
                        <Button variant="ghost" size="icon" onClick={() => removeItem("prescriptions", item._id || item.id)} className="text-slate-200 hover:text-white"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === "appointments" && (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className={panelClassName}>
                  <CardHeader><CardTitle className="text-white">Add appointment</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <Input value={appointmentForm.title} onChange={(e) => setAppointmentForm((c) => ({ ...c, title: e.target.value }))} className={fieldClassName} placeholder="Appointment title" />
                    <Input value={appointmentForm.doctor} onChange={(e) => setAppointmentForm((c) => ({ ...c, doctor: e.target.value }))} className={fieldClassName} placeholder="Doctor" />
                    <Input type="datetime-local" value={appointmentForm.appointmentDate} onChange={(e) => setAppointmentForm((c) => ({ ...c, appointmentDate: e.target.value }))} className={dateFieldClassName} />
                    <Input value={appointmentForm.location} onChange={(e) => setAppointmentForm((c) => ({ ...c, location: e.target.value }))} className={fieldClassName} placeholder="Location" />
                    <Input type="number" min="0" value={appointmentForm.reminderLeadDays} onChange={(e) => setAppointmentForm((c) => ({ ...c, reminderLeadDays: Number(e.target.value) || 0 }))} className={fieldClassName} placeholder="Reminder days before" />
                    <Button onClick={() => addItem("appointments", appointmentForm, () => setAppointmentForm({ title: "", doctor: "", appointmentDate: "", location: "", reminderLeadDays: 2 }))} className="w-full bg-amber-500 text-slate-950">Add appointment</Button>
                  </CardContent>
                </Card>

                <Card className={panelClassName}>
                  <CardHeader><CardTitle className="text-white">Add reminder</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <Input value={reminderForm.title} onChange={(e) => setReminderForm((c) => ({ ...c, title: e.target.value }))} className={fieldClassName} placeholder="Reminder title" />
                    <Input type="datetime-local" value={reminderForm.dueDate} onChange={(e) => setReminderForm((c) => ({ ...c, dueDate: e.target.value }))} className={dateFieldClassName} />
                    <Textarea value={reminderForm.notes} onChange={(e) => setReminderForm((c) => ({ ...c, notes: e.target.value }))} className={`${fieldClassName} min-h-24`} placeholder="Reminder details" />
                    <Button onClick={() => addItem("reminders", reminderForm, () => setReminderForm({ title: "", dueDate: "", notes: "" }))} className="w-full bg-fuchsia-500 text-white">Add reminder</Button>
                  </CardContent>
                </Card>

                <Card className={panelClassName}>
                  <CardHeader><CardTitle className="text-white">Appointments</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {(profile.appointments || []).length === 0 ? <p className="text-slate-100">No appointments yet.</p> : profile.appointments.map((item) => (
                      <div key={item._id || item.id} className="p-4 rounded-xl border border-white/15 bg-black/25 flex justify-between gap-4">
                        <div><p className="font-semibold text-white">{item.title}</p><p className="text-sm text-slate-100">{item.doctor || "Doctor not set"} - {formatDate(item.appointmentDate)}</p><p className="text-sm text-slate-50 mt-2">{item.location || "Location not set"}</p></div>
                        <Button variant="ghost" size="icon" onClick={() => removeItem("appointments", item._id || item.id)} className="text-slate-200 hover:text-white"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

              <Card className={panelClassName}>
                <CardHeader><CardTitle className="text-white">Reminders</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {(profile.reminders || []).length === 0 ? <p className="text-slate-100">No reminders yet.</p> : profile.reminders.map((item) => (
                    <div key={item._id || item.id} className="p-4 rounded-xl border border-white/15 bg-black/25 flex justify-between gap-4">
                      <div><p className="font-semibold text-white">{item.title}</p><p className="text-sm text-slate-100">{formatDate(item.dueDate)}</p><p className="text-sm text-slate-50 mt-2">{item.notes || "No details added."}</p></div>
                      <Button variant="ghost" size="icon" onClick={() => removeItem("reminders", item._id || item.id)} className="text-slate-200 hover:text-white"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            )}

            {/* Scans Tab */}
            {activeTab === "scans" && (
              <Card className={panelClassName}>
                <CardHeader><CardTitle className="text-white">Scan history</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {loading ? <p className="text-slate-100">Loading scan history...</p> : history.length === 0 ? <p className="text-slate-100">No scan history yet.</p> : history.map((item) => (
                    <div key={item._id} className="p-4 rounded-xl border border-white/15 bg-black/25">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-blue-500/15 text-blue-300 border-blue-400/20 capitalize">{item.literacyLevel}</Badge>
                        <span className="text-xs text-slate-100">{formatDate(item.createdAt)}</span>
                      </div>
                      <div className="grid lg:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-slate-950/50 border border-white/10"><p className="text-xs text-slate-100 mb-1 font-medium">Original</p><p className="text-sm text-slate-50 line-clamp-5">{item.originalText}</p></div>
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20"><p className="text-xs text-blue-200 mb-1 font-medium">Simplified</p><p className="text-sm text-white line-clamp-5">{item.simplifiedText}</p></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
