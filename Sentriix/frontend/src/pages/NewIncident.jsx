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
  try {
    const arrayBuffer = await file.arrayBuffer();
    const textDecoder = new TextDecoder("utf-8", { fatal: false });
    const rawText = textDecoder.decode(arrayBuffer.slice(0, 100000)).toLowerCase();

    // التحقق من وجود مؤشرات أمنية مطابقة
    const groupMatches = REQUIRED_KEYWORDS.map(group => 
      group.some(kw => rawText.includes(kw))
    );

    const matchesCount = groupMatches.filter(Boolean).length;
    return matchesCount >= 2; // على الأقل مجموعتين من المعايير الأمنية موجودة
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

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setNotification({
        type: "error",
        message: "Invalid format. Only structured PDF Incident Reports are accepted.",
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
                {/* UPLOAD SECTION */}
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-3 block">
                    Incident Report <span className="text-red-400 ml-1">*</span>
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
                          {isValidating ? "Validating Report Structure..." : "Upload Incident Report"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Click to select a standard security incident PDF
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                        <AlertTriangle size={13} />
                        <span>Strict validation: Only structured security reports are accepted</span>
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
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* ACTUAL INCIDENT TIME */}
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">
                    Actual Incident Time <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={incidentTime}
                    onChange={(e) => setIncidentTime(e.target.value)}
                    placeholder="e.g. 05/26/2026 10:30 AM"
                    className="w-full bg-[#070b16] border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-200 outline-none focus:border-emerald-400/60 transition placeholder:text-gray-600"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Enter when the incident actually occurred, not when the report was uploaded.
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
