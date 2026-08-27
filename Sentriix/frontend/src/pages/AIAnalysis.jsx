import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Gauge,
  ListChecks,
  ArrowLeft,
  LogOut,
  Bug,
  ShieldAlert,
  CheckCircle2,
  ChevronDown,
  Loader2,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { apiService } from "../services/api";

const MOCK_INCIDENTS = [
  {
    id: "INC-0001",
    title: "Ransomware detected on Server-01",
    source: "EDR",
    incident_type: "Ransomware",
    asset_type: "Server",
    asset_criticality: "Critical",
    time: "2026-05-26 10:32:15 AM",
  },
  {
    id: "INC-0002",
    title: "Unusual login from foreign location",
    source: "SIEM",
    incident_type: "Brute Force",
    asset_type: "Workstation",
    asset_criticality: "Medium",
    time: "2026-05-25 03:14:02 PM",
  },
  {
    id: "INC-0003",
    title: "Multiple failed login attempts",
    source: "AD",
    incident_type: "Brute Force",
    asset_type: "Workstation",
    asset_criticality: "Medium",
    time: "2026-05-25 09:10:00 AM",
  },
  {
    id: "INC-0004",
    title: "Data exfiltration attempt blocked",
    source: "DLP",
    incident_type: "Insider Threat",
    asset_type: "Database",
    asset_criticality: "High",
    time: "2026-05-25 06:40:00 AM",
  },
  {
    id: "INC-0005",
    title: "Brute force attack detected",
    source: "Firewall",
    incident_type: "Brute Force",
    asset_type: "Network Device",
    asset_criticality: "High",
    time: "2026-05-24 06:05:00 PM",
  },
  {
    id: "INC-0006",
    title: "Suspicious file execution",
    source: "Firewall",
    incident_type: "Malware",
    asset_type: "Workstation",
    asset_criticality: "Low",
    time: "2026-05-23 11:20:00 AM",
  },
  {
    id: "INC-0007",
    title: "Phishing email detected",
    source: "EDR",
    incident_type: "Phishing",
    asset_type: "Workstation",
    asset_criticality: "Medium",
    time: "2026-05-23 08:15:00 AM",
  },
  {
    id: "INC-0008",
    title: "Privilege escalation attempt",
    source: "SIEM",
    incident_type: "Insider Threat",
    asset_type: "Server",
    asset_criticality: "High",
    time: "2026-05-22 02:30:00 PM",
  },
  {
    id: "INC-0009",
    title: "Malware communication blocked",
    source: "XDR",
    incident_type: "Malware",
    asset_type: "Server",
    asset_criticality: "Critical",
    time: "2026-05-22 09:00:00 AM",
  },
  {
    id: "INC-0010",
    title: "Unauthorized access to database",
    source: "Proxy",
    incident_type: "Insider Threat",
    asset_type: "Database",
    asset_criticality: "Critical",
    time: "2026-05-21 10:50:00 PM",
  },
];

function getStoredIncidents() {
  try {
    return JSON.parse(localStorage.getItem("sentrix_incidents") || "[]");
  } catch {
    return [];
  }
}

const THREAT_CATEGORY = {
  Ransomware: "Malware",
  Malware: "Malware",
  Phishing: "Social Engineering",
  "Brute Force": "Credential Attack",
  "Insider Threat": "Internal Threat",
  DDoS: "Network Attack",
};

const TEMPORARY_AI_RESULT = {
  risk_detected: true,
  risk_score: 87,
};

function generateFindings(incident) {
  return [
    `Suspicious activity related to ${
      incident.incident_type?.toLowerCase() || incident.threat_type?.toLowerCase() || "unknown activity"
    } detected on ${incident.asset_type || incident.affected_asset || "target asset"}.`,
    `Incident originated from telemetry source: ${incident.source || "System Logs"}.`,
    `Asset criticality classified as ${incident.asset_criticality || incident.severity || "Standard"}.`,
    "Indicators of compromise (IOCs) are being cross-referenced with known threat patterns and isolation forest baselines.",
  ];
}

const severityStyle = {
  Critical: "text-red-400",
  High: "text-orange-400",
  Medium: "text-amber-400",
  Low: "text-emerald-400",
  Informational: "text-gray-400",
};

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-100 font-medium text-right max-w-[60%]">
        {value}
      </span>
    </div>
  );
}

export default function AIAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [liveIncident, setLiveIncident] = useState(null);
  const [serverAIAnalysis, setServerAIAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  // جلب تفاصيل الحادثة وتحليل الـ AI الحقيقي مباشرة من السيرفر لمنع أي اختلاف
  useEffect(() => {
    let isMounted = true;

    const fetchAnalysisData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const [incidentData, aiData] = await Promise.all([
          apiService.getIncidentById(id).catch(() => null),
          apiService.getAIAnalysis(id).catch(() => null),
        ]);

        if (isMounted) {
          if (incidentData) setLiveIncident(incidentData);
          if (aiData) setServerAIAnalysis(aiData);
        }
      } catch (err) {
        console.warn("Using local incident fallback for AI Analysis:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnalysisData();
    const interval = setInterval(fetchAnalysisData, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [id]);

  const storedIncidents = getStoredIncidents();
  const allIncidents = [
    ...(liveIncident ? [liveIncident] : []),
    ...storedIncidents,
    ...MOCK_INCIDENTS,
  ];

  const incident = allIncidents.find((inc) => inc.id === id);

  const handleLogout = () => {
    navigate("/login");
  };

  let analysis = null;

  if (incident) {
    // الدمج الفوري مع تحليل السيرفر الحقيقي (Server AI Analysis) لتوحيد النتائج تماماً مع الـ PDF
    const activeRiskScore =
      serverAIAnalysis?.risk_score ??
      incident.risk_score ??
      (incident.severity === "Critical" ? 87 : incident.severity === "High" ? 74 : 52);

    const riskDetected =
      serverAIAnalysis?.risk_detected ??
      (incident.flow ? incident.flow === "full_path" : activeRiskScore > 30);

    const severity = serverAIAnalysis?.severity || incident.severity || incident.asset_criticality || "Medium";
    const threatType = serverAIAnalysis?.threat_type || incident.incident_type || incident.threat_type || incident.title || "Unknown";

    analysis = {
      incident_id: incident.id,
      incident_title: serverAIAnalysis?.incident_title || incident.title || "Incident Analysis",
      severity,
      time: incident.time || incident.actual_incident_time || incident.created_at || "Just now",
      source: incident.source || "Ingestion Pipeline",
      asset: `${incident.asset_type || incident.affected_asset || "Endpoint"}${
        incident.asset_criticality ? ` (${incident.asset_criticality} criticality)` : ""
      }`,
      threat_type: threatType,
      threat_category: THREAT_CATEGORY[threatType] || serverAIAnalysis?.threat_category || "Automated Threat",
      risk_detected: riskDetected,
      risk_score: riskDetected ? activeRiskScore : null,
      analysis_id: `AI-ANL-${String(incident.id).replace("INC-", "")}`,
      model_used:
        serverAIAnalysis?.model_used || incident.model_used || "SentriX Threat Intelligence Model v2.1",
      analysis_time: incident.created_at
        ? new Date(incident.created_at).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : new Date().toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
      data_sources: `${incident.source || "PDF/Telemetry"}, Threat Intel, Behavioral Logs`,
      mitre_tactics: serverAIAnalysis?.mitre_tactics || incident.mitre_tactics || "Impact, Execution, Defense Evasion",
      attack_technique: serverAIAnalysis?.attack_technique || incident.attack_technique || "T1486, T1070, T1059",
      key_findings:
        serverAIAnalysis?.key_findings ||
        (incident.key_findings && Array.isArray(incident.key_findings)
          ? incident.key_findings
          : generateFindings(incident)),
    };
  }

  return (
    <div className="min-h-screen bg-[#070b16] text-[#eef5f1] flex">
      {/* UNIFIED SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-white/10 relative">
          <Link
            to="/incidents"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200"
          >
            <ArrowLeft size={16} />
            Back to Incidents
          </Link>

          {/* User */}
          <div className="relative border-l border-white/10 pl-4">
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                A
              </div>

              <div className="text-xs text-left">
                <p className="font-semibold">Analyst</p>
                <p className="text-gray-500">SOC Analyst</p>
              </div>

              <ChevronDown
                size={14}
                className={`text-gray-500 transition-transform ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-[#0c1220] border border-white/10 rounded-lg shadow-lg overflow-hidden z-10">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {!analysis ? (
            <div className="bg-[#0c1220] border border-white/10 rounded-2xl p-10 text-center">
              <Sparkles size={32} className="text-emerald-400 mx-auto mb-4" />
              <h2 className="text-lg font-bold mb-2">No Incident Selected</h2>
              <p className="text-sm text-gray-400 mb-6">
                Please upload or create a new incident report to view its AI analysis.
              </p>
              <Link
                to="/new-incident"
                className="inline-block bg-gradient-to-r from-emerald-400 to-green-600 text-[#04140b] font-bold px-6 py-2.5 rounded-lg hover:opacity-90 transition text-sm"
              >
                + New Incident
              </Link>
            </div>
          ) : (
            <>
              {/* PAGE TITLE */}
              <div>
                <h1 className="text-2xl font-bold">AI Analysis</h1>
                <p className="text-gray-400 text-sm">
                  AI-driven analysis and neural anomaly scoring for the selected incident
                </p>
              </div>

              {/* INCIDENT SUMMARY */}
              <div className="bg-[#0c1220] border border-white/10 rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center text-red-400">
                    <ShieldAlert size={20} />
                  </div>

                  <div>
                    <p className="font-semibold font-mono">{analysis.incident_id}</p>
                    <p className="text-sm text-gray-400">{analysis.incident_title}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {analysis.time} &nbsp;•&nbsp; {analysis.source} &nbsp;•&nbsp; {analysis.asset}
                    </p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-full text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {analysis.severity}
                </span>
              </div>

              {/* THREAT / RISK / SEVERITY CARDS */}
              <div className="grid grid-cols-3 gap-4">
                {/* THREAT TYPE */}
                <div className="bg-[#0c1220] border border-white/10 rounded-xl p-6 flex flex-col items-center text-center">
                  <p className="text-sm font-semibold text-gray-300 mb-3">Threat Type</p>
                  <div className="w-12 h-12 rounded-full bg-purple-500/15 flex items-center justify-center text-purple-400 mb-3">
                    <Bug size={22} />
                  </div>
                  <p className="text-lg font-bold text-purple-300">{analysis.threat_type}</p>
                  <p className="text-xs text-gray-500">{analysis.threat_category}</p>
                </div>

                {/* RISK ASSESSMENT */}
                <div className="bg-[#0c1220] border border-white/10 rounded-xl p-6 flex flex-col items-center text-center">
                  <p className="text-sm font-semibold text-gray-300 mb-3">Risk Assessment</p>
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                      analysis.risk_detected
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-emerald-500/15 text-emerald-400"
                    }`}
                  >
                    <Gauge size={22} />
                  </div>

                  {analysis.risk_detected ? (
                    <>
                      <p className="text-lg font-bold text-amber-400">
                        {analysis.risk_score} <span className="text-sm text-gray-500">/ 100</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {analysis.risk_score >= 80
                          ? "Severe Risk"
                          : analysis.risk_score >= 60
                          ? "High Risk"
                          : "Moderate Risk"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-emerald-400">No Risk Detected</p>
                      <p className="text-xs text-gray-500">No significant security risk identified</p>
                    </>
                  )}
                </div>

                {/* SEVERITY */}
                <div className="bg-[#0c1220] border border-white/10 rounded-xl p-6 flex flex-col items-center text-center">
                  <p className="text-sm font-semibold text-gray-300 mb-3">Severity</p>
                  <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center text-red-400 mb-3">
                    <ShieldAlert size={22} />
                  </div>
                  <p
                    className={`text-lg font-bold ${
                      severityStyle[analysis.severity] || "text-gray-300"
                    }`}
                  >
                    {analysis.severity}
                  </p>
                  <p className="text-xs text-gray-500">
                    {analysis.risk_detected
                      ? analysis.severity === "Critical" || analysis.severity === "High"
                        ? "Immediate Action Required"
                        : "Monitor and Review"
                      : "No Risk Identified"}
                  </p>
                </div>
              </div>

              {/* NO RISK MESSAGE */}
              {!analysis.risk_detected && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={20}
                      className="text-emerald-400 shrink-0 mt-0.5"
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-emerald-400">
                        No Security Risk Detected
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        The AI analysis did not identify a significant security risk in this incident.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI SUMMARY */}
              <div className="bg-[#0c1220] border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ListChecks size={16} className="text-emerald-400" />
                  <h2 className="text-sm font-semibold text-gray-200">AI Analysis Summary</h2>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  {/* LEFT */}
                  <div>
                    <InfoRow label="Analysis ID" value={analysis.analysis_id} />
                    <InfoRow label="Model Used" value={analysis.model_used} />
                    <InfoRow label="Analysis Time" value={analysis.analysis_time} />
                    <InfoRow label="Data Sources" value={analysis.data_sources} />
                    <InfoRow label="MITRE ATT&CK Tactics" value={analysis.mitre_tactics} />
                    <InfoRow label="Attack Technique" value={analysis.attack_technique} />
                  </div>

                  {/* RIGHT */}
                  <div>
                    <p className="text-sm font-semibold text-gray-300 mb-3">Key Findings</p>
                    <ul className="space-y-2.5">
                      {analysis.key_findings.map((finding, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle2
                            size={16}
                            className="text-emerald-400 shrink-0 mt-0.5"
                          />
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* RISK RECOMMENDATIONS LINK */}
              {analysis.risk_detected && (
                <div className="text-center">
                  <Link
                    to={`/recommendations/${id}`}
                    className="inline-flex items-center gap-2 border-2 border-dashed border-emerald-500/40 text-emerald-400 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-500/5 transition"
                  >
                    View Recommendations →
                  </Link>
                  <p className="text-xs text-gray-600 mt-2">
                    View AI recommendations and mitigation playbooks based on this incident's risk score
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
