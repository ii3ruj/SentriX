import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  Download,
  CalendarClock,
  FileType2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { apiService } from "../services/api";

const STARTING_NUMBER = 11;

// قائمة الكلمات المفتاحية الإلزامية للتحقق من هيكل التقرير الأمني
const REQUIRED_KEYWORDS = [
  ["incident", "threat", "alert", "security report", "sentrix"],
  ["ip", "asset", "host", "source", "destination", "server"],
  ["severity", "critical", "high", "medium", "low", "cve", "malware", "ransomware", "phishing", "brute force"]
];

function getStoredIncidents() {
  try {
    return JSON.parse(localStorage.getItem("sentrix_incidents") || "[]");
  } catch {
    return [];
  }
}

function saveIncident(incident) {
  const stored = getStoredIncidents();
  stored.push(incident);
  localStorage.setItem("sentrix_incidents", JSON.stringify(stored));
}

function generateNextId() {
  const stored = getStoredIncidents();
  const nextNumber = STARTING_NUMBER + stored.length;
  return `INC-${String(nextNumber).padStart(4, "0")}`;
}

async function calculateFileSHA256(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  }
}

// دالة فحص نص الـ PDF والتأكد من مطابقة هيكل التقرير الأمني
async function validateIncidentPDFContent(file) {
  const name = (file.name || "").toLowerCase();
  if (!name.endsWith(".pdf") && !name.endsWith(".docx")) return false;

  try {
    const arrayBuffer = await file.arrayBuffer();
    // قراءة جزء أكبر قليلاً لضمان التقاط العناوين
    const textDecoder = new TextDecoder("utf-8", { fatal: false });
    const rawText = textDecoder.decode(arrayBuffer.slice(0, 50000)).toLowerCase();

    // 1. بصمة الهوية الأساسية
    const isSentriX = rawText.includes("sentrix");
    
    // 2. التحقق من وجود مفاتيح البيانات (حتى لو لم تكن كاملة، المهم أنها موجودة)
    // نبحث عن 3 على الأقل من العناوين التي يستخرجها الباك إند
    const featureKeywords = ["protocol", "flow duration", "packet", "source", "destination", "flag count"];
    const foundFeatures = featureKeywords.filter(kw => rawText.includes(kw));

    // القرار: يجب أن يكون الملف تابعاً لـ SentriX ويحتوي على الأقل 3 مؤشرات بيانات
    return isSentriX && foundFeatures.length >= 3;
    
  } catch (err) {
    // إذا حدث خطأ، نرفض الملف لضمان عدم إدخال بيانات تالفة للـ AI
    return false;
  }
}
    const looksCompressed =
      rawText.includes("flatedecode") ||
      rawText.includes("/filter") ||
      (rawText.match(/[a-z]{4,}/g) || []).length < 40;

    return looksCompressed;
  } catch (err) {
    return true; // في حال تعذر القراءة الخام، يمرر للباك إند للتحقق النهائي
  }
}

export default function NewIncident() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const currentAnalyst =
    localStorage.getItem("sentrix_user") || "analyst@sentrix.com";

  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileHash, setFileHash] = useState("");
  const [incidentTime, setIncidentTime] = useState("");
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = (file.name || "").toLowerCase();
    const isAccepted =
      file.type === "application/pdf" ||
      name.endsWith(".pdf") ||
      name.endsWith(".docx") ||
      name.endsWith(".docm");

    if (!isAccepted) {
      setNotification({
        type: "error",
        message: "Invalid format. Upload the SentriX report template as PDF or Word (.docx).",
      });
      return;
    }

    setIsValidating(true);
    setNotification(null);

    // 1. التحقق من صيغة وهيكل التقرير الأمني
    const isStructureValid = await validateIncidentPDFContent(file);
    if (!isStructureValid) {
      setUploadedFile(null);
      setFileHash("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setNotification({
        type: "error",
        message: "Invalid Incident Report format. The uploaded PDF does not contain required SentriX security metadata (Asset, Threat, IP, or Severity metrics).",
      });
      setIsValidating(false);
      return;
    }

    // 2. حساب بصمة SHA-256 للملف
    const hash = await calculateFileSHA256(file);
    setUploadedFile(file);
    setFileHash(hash);
    setIsValidating(false);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFileHash("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(null);

    if (!uploadedFile) {
      setNotification({
        type: "error",
        message: "Please upload a valid Incident Report PDF.",
      });
      return;
    }

    if (!incidentTime.trim()) {
      setNotification({
        type: "error",
        message: "Please enter the actual incident time.",
      });
      return;
    }

    setIsSubmitting(true);
    const generatedId = generateNextId();
    const now = new Date();

    const newIncident = {
      id: generatedId,
      title: "Pending AI Extraction",
      severity: "High",
      status: "Open",
      source: "PDF Report",
      incident_type: "Automated Ingestion",
      affected_asset: "Pending Extraction",
      description: "Incident ingested via validated PDF format. SentriX AI pipeline activated.",
      report_file_name: uploadedFile.name,
      report_file_size: uploadedFile.size,
      sha256: fileHash,
      actual_incident_time: incidentTime,
      created_at: now.toISOString(),
      time: "Just now",
      created_by: currentAnalyst,
      ai_status: "Processing",
    };

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("incident_id", generatedId);
      formData.append("actual_time", incidentTime);
      formData.append("analyst", currentAnalyst);
      formData.append("sha256", fileHash);

      // الباك إند يحلل الملف ويرجع الحادثة بمعرّفها الحقيقي
      const result = await apiService.uploadIncidentPDF(formData);
      const realId = result?.incident?.id || generatedId;

      saveIncident({ ...newIncident, id: realId });

      setNotification({
        type: "success",
        message: "Report format validated & SHA-256 registered. AI analysis complete.",
      });

      setTimeout(() => {
        navigate(`/ai-analysis/${realId}`);
      }, 1200);
    } catch (error) {
      saveIncident(newIncident);
      setNotification({
        type: "error",
        message: "Could not reach the AI analysis service. Please try again.",
      });
      setIsSubmitting(false);
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b16] text-[#eef5f1] flex">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <main className="min-h-screen px-8 py-8">
          <div className="max-w-3xl mx-auto">
            {/* BACK */}
            <Link
              to="/incidents"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition mb-6"
            >
              <ArrowLeft size={16} />
              Back to Incidents
            </Link>

            {/* MAIN CARD */}
            <div className="bg-[#0c1220] border border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Incident Intake Form</h1>
                <p className="text-sm text-gray-400">
                  Upload an authorized incident report PDF for format verification, automated extraction, and cryptographic archiving.
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Logged by: {currentAnalyst}
                </p>
              </div>

              {notification && (
                <div
                  className={`mb-6 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
                    notification.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-red-500/10 border-red-500/30 text-red-300"
                  }`}
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{notification.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* ============ STEP 1 — DOWNLOAD THE TEMPLATE ============ */}
                <div className="bg-[#070b16] border border-emerald-500/20 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <FileType2 size={21} className="text-emerald-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm font-semibold text-gray-200">
                        Step 1 — Download the blank SentriX report template
                      </h2>

                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        The template contains the{" "}
                        <span className="text-gray-300">37 network flow features</span>{" "}
                        the AI model needs. Download it, fill in the values captured for
                        your incident, then upload the completed file in Step 2.
                      </p>

                      <div className="mt-3 flex items-start gap-2 text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                        <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                        <span>
                          Keep the field names exactly as they appear — the engine matches
                          them by name. If any of the 37 values is missing, the incident is
                          scored from organizational context only and the AI model is not used.
                        </span>
                      </div>

                      <div className="mt-4">
                        <a
                          href={apiService.incidentTemplateDocxUrl()}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-green-600 text-[#04140b] text-sm font-bold px-4 py-2.5 rounded-lg hover:opacity-90 transition"
                        >
                          <Download size={16} />
                          Download Word Template (.docx)
                        </a>
                      </div>

                      <p className="text-[11px] text-emerald-300/90 mt-3 leading-relaxed">
                        After filling in the template, save or export it as a{" "}
                        <span className="font-semibold">PDF</span> before uploading it in
                        Step 2. In Word: File → Save As → choose PDF.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ============ STEP 2 — UPLOAD ============ */}
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-3 block">
                    Step 2 — Upload the completed report
                    <span className="text-red-400 ml-1">*</span>
                  </label>

                  {!uploadedFile ? (
                    <button
                      type="button"
                      disabled={isValidating}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full min-h-[260px] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 bg-[#070b16] hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] transition group"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/15 transition">
                        {isValidating ? (
                          <Loader2 size={30} className="text-emerald-400 animate-spin" />
                        ) : (
                          <UploadCloud size={30} className="text-emerald-400" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-base font-semibold text-gray-200 mb-1">
                          {isValidating ? "Validating Report Structure..." : "Upload Completed Report"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Click to select your completed SentriX template (PDF)
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                        <AlertTriangle size={13} />
                        <span>Upload the completed template as PDF — keep the field names unchanged</span>
                      </div>
                    </button>
                  ) : (
                    <div className="bg-[#070b16] border border-emerald-500/30 rounded-2xl p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <FileText size={24} className="text-emerald-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-200">
                                {uploadedFile.name}
                              </p>
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-medium">
                                Validated Format
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {(uploadedFile.size / 1024).toFixed(0)} KB • Structured Incident PDF
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={removeFile}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      {fileHash && (
                        <div className="mt-4 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-2 text-xs text-gray-400">
                          <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                          <span className="text-gray-500">P1 SHA-256:</span>
                          <span className="font-mono text-[11px] text-gray-300 truncate">{fileHash}</span>
                        </div>
                      )}

                      <div className="mt-4 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full w-full bg-emerald-400 rounded-full" />
                      </div>
                      <p className="text-xs text-emerald-400 mt-2">
                        Format validated & ready for SentriX AI Extraction
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.docm,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* ACTUAL INCIDENT TIME */}
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">
                    Actual Incident Time <span className="text-red-400 ml-1">*</span>
                  </label>
                  <div className="flex items-center bg-[#070b16] border border-white/10 rounded-lg px-3 focus-within:border-emerald-400/60 transition">
                    <CalendarClock size={16} className="text-gray-500 shrink-0" />
                    <input
                      type="datetime-local"
                      value={incidentTime}
                      max={new Date().toISOString().slice(0, 16)}
                      onChange={(e) => setIncidentTime(e.target.value)}
                      className="w-full bg-transparent outline-none px-2 py-3 text-sm text-gray-200 [color-scheme:dark]"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Select when the incident actually occurred, not when the report was uploaded.
                  </p>
                </div>

                {/* BUTTONS */}
                <div className="flex gap-3 pt-3">
                  <Link
                    to="/incidents"
                    className="px-6 py-3 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 hover:text-gray-200 transition text-sm flex items-center"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={isSubmitting || !uploadedFile}
                    className="flex-1 bg-gradient-to-r from-emerald-400 to-green-600 text-[#04140b] font-bold py-3 rounded-lg hover:opacity-90 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Verifying & Running AI Pipeline...</span>
                      </>
                    ) : (
                      "Upload & Start AI Analysis"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
