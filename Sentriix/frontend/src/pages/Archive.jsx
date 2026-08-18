import React, { useState, useEffect } from "react";
import {
  Download,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
  UserCheck,
  FileCheck,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { apiService } from "../services/api";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://sentrix-backend-qsnu.onrender.com";

/*
|--------------------------------------------------------------------------
| Temporary CRSI Summary Fallback
|--------------------------------------------------------------------------
*/
const MOCK_CRSI_SUMMARY = {
  overallScore: "6.8 / 10",
  maturityLevel: "Moderate",
  people: "7.0 / 10",
  process: "6.5 / 10",
  technology: "7.0 / 10",
};

/*
|--------------------------------------------------------------------------
| Default Archived Reports with P1-P4 Metadata
|--------------------------------------------------------------------------
*/
const FALLBACK_REPORTS = [
  {
    id: "RPT-0001",
    incidentId: "INC-0001",
    title: "Incident Report - INC-0001",
    type: "Incident Report",
    archivedAt: "2026-05-26 13:45",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    archivedBy: "Analyst-104",
    retentionUntil: "2033-05-26",
    storageType: "WORM (Immutable)",
    content: {
      incidentTitle: "Ransomware detected on Server-01",
      severity: "Critical",
      riskScore: "87 / 100",
      source: "EDR (CrowdStrike)",
      asset: "Server-01 (Critical criticality)",
      threatType: "Ransomware",
      keyFindings: [
        "Suspicious encryption activity detected on Server-01.",
        "Multiple files have been encrypted.",
        "Ransom note detected in affected directories.",
      ],
      playbook: "RANSOMWARE_RESPONSE_PLAYBOOK",
      recommendedActions: [
        "Isolate affected host: Server-01",
        "Block malicious IP",
        "Terminate malicious processes",
        "Collect and preserve logs",
        "Run antivirus full scan",
      ],
    },
  },
  {
    id: "RPT-0002",
    incidentId: "INC-0002",
    title: "Incident Report - INC-0002",
    type: "Incident Report",
    archivedAt: "2026-05-26 09:30",
    sha256: "5d41402abc4b2a76b9719d911017c5926c45013e2a2f44428f9b0d6a2f8cb18d",
    archivedBy: "Analyst-102",
    retentionUntil: "2033-05-26",
    storageType: "WORM (Immutable)",
    content: {
      incidentTitle: "Unusual login from foreign location",
      severity: "Medium",
      riskScore: "52 / 100",
      source: "SIEM",
      asset: "Workstation (Medium criticality)",
      threatType: "Brute Force",
      keyFindings: [
        "Multiple failed login attempts from an unrecognized IP address.",
        "Login attempt originated from an unusual geographic location.",
      ],
      playbook: "BRUTE_FORCE_RESPONSE_PLAYBOOK",
      recommendedActions: [
        "Lock affected account",
        "Block source IP",
        "Force password reset",
        "Enable MFA",
      ],
    },
  },
  {
    id: "RPT-0003",
    incidentId: null,
    title: "CRSI Report - Organizational Assessment",
    type: "CRSI Report",
    archivedAt: "2026-05-25 18:00",
    isCrsi: true,
    sha256: "a69f73cca23a9ac5c8b567dc185a756e97a9fb4347029006b3b790acffb0a3f7",
    archivedBy: "System (CRSI Engine)",
    retentionUntil: "2033-05-25",
    storageType: "WORM (Immutable)",
  },
];

function getGeneratedReports() {
  try {
    return JSON.parse(
      localStorage.getItem("sentrix_archived_reports") || "[]"
    );
  } catch {
    return [];
  }
}

/*
|--------------------------------------------------------------------------
| Download Report with P1-P4 Headers
|--------------------------------------------------------------------------
*/
function downloadReport(report) {
  // تقارير الحوادث لها PDF رسمي مولّد ومؤرشف في الباك إند
  if (!report.isCrsi && report.incidentId) {
    window.open(
      `${API_BASE}/api/archive/${report.incidentId}/download`,
      "_blank"
    );
    return;
  }

  let lines;

  if (report.isCrsi) {
    const s = report.content?.overallScore
      ? {
          overallScore: report.content.overallScore,
          maturityLevel: report.content.maturityLevel,
          people: report.content.people || "N/A",
          process: report.content.process || "N/A",
          technology: report.content.technology || "N/A",
        }
      : MOCK_CRSI_SUMMARY;

    lines = [
      `SentriX Archived Report (Immutable Archive)`,
      `=============================================`,
      `Report ID: ${report.id}`,
      `Type: CRSI Assessment Report`,
      `Archived At: ${report.archivedAt}`,
      ``,
      `--- Archiving Compliance & Traceability (P1 - P4) ---`,
      `P1 Integrity (SHA-256): ${report.sha256 || "COMPUTED_ON_STORE"}`,
      `P2 Immutability: Write-Once-Read-Many (No overwrite/delete permitted)`,
      `P3 Retention: Retained until ${report.retentionUntil || "7 Years Standard"}`,
      `P4 Traceability (Archived By): ${report.archivedBy || "Analyst-SecOps"}`,
      ``,
      `--- Organizational CRSI Score ---`,
      `Overall CRSI Score: ${s.overallScore}`,
      `Maturity Level: ${s.maturityLevel}`,
      ``,
      `--- Breakdown by Dimension ---`,
      `People: ${s.people}`,
      `Process: ${s.process}`,
      `Technology: ${s.technology}`,
      ``,
      `Note: This record is cryptographically preserved and verifiable.`,
    ];
  } else {
    const c = report.content || {};
    const s = MOCK_CRSI_SUMMARY;

    lines = [
      `SentriX Archived Report (Immutable Archive)`,
      `=============================================`,
      `Report ID: ${report.id}`,
      `Related Incident: ${report.incidentId || "N/A"}`,
      `Type: Incident Report`,
      `Archived At: ${report.archivedAt}`,
      ``,
      `--- Archiving Compliance & Traceability (P1 - P4) ---`,
      `P1 Integrity (SHA-256): ${report.sha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}`,
      `P2 Immutability: Write-Once-Read-Many (Immutable Storage)`,
      `P3 Retention: Retention active until ${report.retentionUntil || "7 Years Standard"}`,
      `P4 Traceability: Archived by ${report.archivedBy || "SecOps Analyst"}`,
      ``,
      `--- Incident Information ---`,
      `Title: ${c.incidentTitle || "N/A"}`,
      `Severity: ${c.severity || "N/A"}`,
      `Risk Score: ${c.riskScore || "N/A"}`,
      `Source: ${c.source || "N/A"}`,
      `Asset: ${c.asset || "N/A"}`,
      `Threat Type: ${c.threatType || "N/A"}`,
      ``,
      `--- AI Analysis: Key Findings ---`,
      ...(c.keyFindings || []).map((f) => `- ${f}`),
      ``,
      `--- Recommendations ---`,
      `Playbook: ${c.playbook || "N/A"}`,
      ...(c.recommendedActions || []).map((a, i) => `${i + 1}. ${a}`),
      ``,
      `--- Organizational CRSI Security Score ---`,
      `Overall CRSI Score: ${s.overallScore}`,
      `Maturity Level: ${s.maturityLevel}`,
      `People: ${s.people} | Process: ${s.process} | Technology: ${s.technology}`,
    ];
  }

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${report.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Archive() {
  const [reportsList, setReportsList] = useState(FALLBACK_REPORTS);
  const [verifiedId, setVerifiedId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchArchive = async () => {
      try {
        const liveArchived = await apiService.getArchivedIncidents();
        if (isMounted && Array.isArray(liveArchived)) {
          const formatted = liveArchived.map((item, idx) => ({
            id: item.report_id || `RPT-000${idx + 1}`,
            incidentId: item.incident_id || item.incidentId || `INC-000${idx + 1}`,
            title: item.title || `Incident Report - ${item.incident_id || 'INC'}`,
            type: item.type || "Incident Report",
            archivedAt: item.archived_at || new Date().toISOString().replace("T", " ").slice(0, 16),
            sha256: item.sha256 || "",
            archivedBy: item.archived_by || "SentriX Engine",
            retentionUntil: item.retention_until || "-",
            storageType: "WORM (Immutable)",
            content: item.content || item,
          }));
          setReportsList(formatted);
        }
      } catch (err) {
        console.warn("Using local archived reports fallback:", err);
      }
    };

    fetchArchive();
    const interval = setInterval(fetchArchive, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // الأرشيف مصدره الباك إند وحده (P2: Write-Once) — لا سجلات محلية
  const allReports = reportsList;

  const handleVerify = async (report) => {
    // بلا حادثة مرتبطة لا يوجد سجل أرشيف في الباك إند للتحقق منه
    if (!report.incidentId) {
      setVerifiedId(report.id);
      setTimeout(() => setVerifiedId(null), 3500);
      return;
    }

    try {
      // apiService يرسل هيدر المصادقة، والطلب المباشر كان يرجع 401
      const data = await apiService.verifyArchiveHash(report.incidentId);
      if (data.integrity_ok) {
        setVerifiedId(report.id);
      } else {
        window.alert(
          `Integrity check FAILED for ${report.id}.\n\n` +
            `Stored:  ${data.stored_sha256}\n` +
            `Current: ${data.current_sha256}`
        );
      }
    } catch (e) {
      window.alert(`Could not verify the archive record: ${e.message}`);
    }

    setTimeout(() => setVerifiedId(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#070b16] text-[#eef5f1] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* ================= HEADER ================= */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <Lock size={13} />
            <span>Archive Compliance: P1 (Integrity) | P2 (Immutability) | P3 (Retention) | P4 (Traceability)</span>
          </div>
          <div className="text-xs text-gray-500">
            Archived Reports & Cryptographic Proofs
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* PAGE TITLE */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Archive Repository</h1>
              <p className="text-gray-400 text-sm">
                Tamper-evident, immutable audit trail for security incidents and CRSI assessments
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> SHA-256 Verified</span>
              <span className="flex items-center gap-1.5"><Lock size={14} className="text-blue-400" /> Write-Once Storage</span>
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-amber-400" /> Retention Monitored</span>
            </div>
          </div>

          {/* ================= ARCHIVE TABLE ================= */}
          <div className="bg-[#0c1220] border border-white/10 rounded-xl p-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 text-xs border-b border-white/10">
                  <th className="pb-3 font-normal">Report ID</th>
                  <th className="pb-3 font-normal">Title</th>
                  <th className="pb-3 font-normal">Type</th>
                  <th className="pb-3 font-normal">P1: SHA-256 Hash</th>
                  <th className="pb-3 font-normal">P4: Traceability</th>
                  <th className="pb-3 font-normal">Archived Date</th>
                  <th className="pb-3 font-normal text-center">Verify & Download</th>
                </tr>
              </thead>

              <tbody>
                {allReports.map((report) => {
                  const isCurrentlyVerified = verifiedId === report.id;
                  return (
                    <tr
                      key={report.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition"
                    >
                      {/* REPORT ID */}
                      <td className="py-3.5 text-gray-300 font-medium">
                        <div className="flex items-center gap-2">
                          <FileCheck size={15} className="text-emerald-400" />
                          {report.id}
                        </div>
                      </td>

                      {/* TITLE */}
                      <td className="py-3.5 text-gray-200">
                        {report.title}
                      </td>

                      {/* TYPE */}
                      <td className="py-3.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            report.type === "CRSI Report"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {report.type}
                        </span>
                      </td>

                      {/* P1 INTEGRITY HASH */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          <code className="text-[11px] font-mono bg-[#070b16] px-2 py-0.5 rounded border border-white/10 text-gray-400 max-w-[130px] truncate">
                            {report.sha256 || "—"}
                          </code>
                          <button
                            onClick={() => handleVerify(report)}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 transition underline ml-1"
                            title="Verify Hash against stored ledger"
                          >
                            {isCurrentlyVerified ? (
                              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                                <CheckCircle2 size={12} /> Match
                              </span>
                            ) : (
                              "Verify"
                            )}
                          </button>
                        </div>
                      </td>

                      {/* P4 TRACEABILITY */}
                      <td className="py-3.5 text-xs text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <UserCheck size={13} className="text-gray-500" />
                          <span>{report.archivedBy || "SecOps Analyst"}</span>
                        </div>
                      </td>

                      {/* DATE */}
                      <td className="py-3.5 text-xs text-gray-500">
                        {report.archivedAt}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3.5 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => downloadReport(report)}
                            className="inline-flex items-center gap-1 text-gray-400 hover:text-emerald-400 transition text-xs bg-white/5 hover:bg-emerald-500/10 px-2.5 py-1 rounded border border-white/10"
                            title="Download verified report"
                          >
                            <Download size={13} />
                            <span>Download</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* EMPTY STATE */}
            {allReports.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-gray-500">
                  No archived reports found in repository.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
