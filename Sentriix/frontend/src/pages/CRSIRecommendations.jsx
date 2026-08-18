import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  ArrowLeft,
  FileText,
  Download,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { apiService } from "../services/api";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://sentrix-backend-qsnu.onrender.com";

const DEFAULT_RECOMMENDATIONS = [
  {
    id: 1,
    title: "Isolate affected host",
    description: "Disconnect the affected host from the network to prevent further spread.",
    priority: "High",
    status: "Completed",
  },
  {
    id: 2,
    title: "Block malicious IP",
    description: "Add identified malicious IP addresses to the firewall blocklist.",
    priority: "High",
    status: "Completed",
  },
  {
    id: 3,
    title: "Terminate malicious processes",
    description: "Stop suspicious processes related to the detected ransomware activity.",
    priority: "Medium",
    status: "Completed",
  },
  {
    id: 4,
    title: "Collect and preserve logs",
    description: "Collect endpoint, network, authentication, and security logs for investigation.",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: 5,
    title: "Identify affected files",
    description: "Identify encrypted, modified, or otherwise affected files and directories.",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: 6,
    title: "Reset compromised credentials",
    description: "Reset credentials associated with potentially compromised accounts.",
    priority: "High",
    status: "Pending",
  },
  {
    id: 7,
    title: "Scan connected systems",
    description: "Perform security scans across connected systems to identify additional compromise.",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: 8,
    title: "Restore affected services",
    description: "Restore affected systems and services after confirming the environment is clean.",
    priority: "Low",
    status: "Pending",
  },
];

export default function Recommendations() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [incident, setIncident] = useState({
    id: id || "",
    title: "Ransomware detected on Server-01",
    severity: "Critical",
    riskScore: 87,
    playbook: "RANSOMWARE_RESPONSE_PLAYBOOK",
  });

  const [recommendationsList, setRecommendationsList] = useState(DEFAULT_RECOMMENDATIONS);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchIncidentAIRecommendations = async () => {
      try {
        // بلا معرّف في الرابط كانت الصفحة تفترض INC-0001 وهو قد لا يكون
        // موجوداً، فيرجع الأرشيف "Not found". الآن نأخذ أحدث حادثة فعلية.
        let targetId = id;
        if (!targetId) {
          const latest = await apiService.getRecommendations();
          targetId = latest?.incident_id;
          if (!targetId) return;
        }

        const incidentData = await apiService.getIncidentById(targetId);
        if (isMounted && incidentData) {
          setIncident({
            id: incidentData.id || targetId,
            title: incidentData.title || "Security Incident",
            severity: incidentData.severity || "Medium",
            riskScore: incidentData.risk_score ?? 0,
            playbook: incidentData.playbook || "GENERIC_RESPONSE_PLAYBOOK",
          });

          // الباك إند يرسل recommended_actions لكل حادثة حسب الـplaybook الخاص بها
          if (Array.isArray(incidentData.recommended_actions)) {
            const mapped = incidentData.recommended_actions.map((act, index) => ({
              id: act.action_order || index + 1,
              title: typeof act === "string" ? act : act.title,
              description:
                typeof act === "string"
                  ? "Response action from the matched playbook."
                  : act.description,
              priority: typeof act === "string" ? "Medium" : act.priority,
              status: typeof act === "string" ? "Pending" : act.status,
            }));
            setRecommendationsList(mapped);
          }
        }
      } catch (err) {
        console.warn("Using fallback recommendations:", err);
      }
    };

    fetchIncidentAIRecommendations();
    const interval = setInterval(fetchIncidentAIRecommendations, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [id]);

  const getPriorityStyle = (priority) => {
    if (priority === "High" || priority === "Critical") {
      return "bg-red-500/10 text-red-400 border border-red-500/20";
    }
    if (priority === "Medium") {
      return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    }
    return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  };

  const getStatusStyle = (status) => {
    if (status === "Completed") {
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
    return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
  };

  const handleGenerateReport = async () => {
    if (!incident.id) {
      window.alert("No incident is loaded yet. Please wait for the analysis to load.");
      return;
    }

    const confirmed = window.confirm(
      `Generate and archive the report for ${incident.id}?\n\n` +
      `The report will be stored as an immutable snapshot with a SHA-256 ` +
      `integrity fingerprint and retained for 7 years.`
    );
    if (!confirmed) return;

    setIsArchiving(true);

    try {
      // يمر عبر apiService حتى يُرسل هيدر المصادقة.
      // الطلب المباشر بـ fetch كان يصل بلا توكن فيرجع 401،
      // وهذا سبب رسالة "Could not reach the archive service".
      const verification = await apiService.verifyArchiveHash(incident.id);

      window.open(apiService.archiveDownloadUrl(incident.id), "_blank");

      window.alert(
        `Report archived successfully.\n\n` +
          `Report ID: ${incident.id}\n` +
          `SHA-256: ${String(verification.stored_sha256 || "").slice(0, 32)}...\n` +
          `Integrity verified: ${verification.integrity_ok ? "PASSED" : "FAILED"}\n` +
          `Archived by: ${verification.archived_by || "SentriX Engine"}\n` +
          `Retention until: ${verification.retention_until || "-"}`
      );

      navigate("/archive");
    } catch (e) {
      window.alert(`Could not archive the report: ${e.message}`);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b16] text-[#eef5f1] flex">
      {/* UNIFIED SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0">
        {/* HEADER */}
        <header className="px-8 py-7 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate(`/ai-analysis/${incident.id}`)}
              className="text-gray-500 hover:text-emerald-400 transition"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="text-sm text-gray-500">AI Analysis</span>
            <span className="text-gray-700">/</span>
            <span className="text-sm text-emerald-400">Recommendations</span>
          </div>

          <h1 className="text-3xl font-bold">Recommendations</h1>
          <p className="text-sm text-gray-500 mt-1">
            AI-driven response recommendations and mitigation playbooks for the selected incident
          </p>
        </header>

        {/* CONTENT */}
        <div className="p-8 max-w-[1250px] mx-auto">
          {/* INCIDENT SUMMARY */}
          <section className="bg-[#0c1220] border border-white/10 rounded-2xl px-6 py-5 mb-5">
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-2">Incident ID</p>
                <p className="font-bold text-white font-mono">{incident.id}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Title</p>
                <p className="font-semibold text-gray-200">{incident.title}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Severity</p>
                <span
                  className={`inline-flex px-3 py-1 rounded-md text-xs font-semibold ${
                    incident.severity === "Critical"
                      ? "bg-red-500/10 border border-red-500/20 text-red-400"
                      : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {incident.severity}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Risk Score</p>
                <p className="text-lg font-bold text-yellow-400">
                  {incident.riskScore}
                  <span className="text-sm text-gray-500"> / 100</span>
                </p>
              </div>
            </div>
          </section>

          {/* TWO COLUMN LAYOUT */}
          <div className="grid lg:grid-cols-[1fr_280px] gap-5">
            {/* LEFT COLUMN */}
            <div className="space-y-5">
              {/* RECOMMENDED PLAYBOOK */}
              <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <BookOpen size={21} className="text-purple-400" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Recommended Playbook</p>
                    <h2 className="text-purple-400 font-bold text-base">
                      {incident.playbook}
                    </h2>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      This response playbook is automatically generated based on AI threat scoring, isolation forest classification, and organizational CRSI posture.
                    </p>
                  </div>
                </div>

                {/* Actions Heading */}
                <div className="flex items-center justify-between mt-7 mb-4">
                  <h3 className="font-semibold">
                    Recommended Actions
                    <span className="text-gray-500 ml-1">({recommendationsList.length})</span>
                  </h3>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {recommendationsList.map((recommendation) => (
                    <div
                      key={recommendation.id}
                      className="bg-[#070b16] border border-white/5 rounded-xl px-4 py-4 hover:border-emerald-500/20 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-6 text-xs text-gray-500 font-semibold shrink-0">
                          {recommendation.id}.
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-200">
                            {recommendation.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {recommendation.description}
                          </p>
                        </div>

                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-full font-semibold shrink-0 ${getPriorityStyle(
                            recommendation.priority
                          )}`}
                        >
                          {recommendation.priority}
                        </span>

                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-full font-semibold shrink-0 ${getStatusStyle(
                            recommendation.status
                          )}`}
                        >
                          {recommendation.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-5">
              <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={16} className="text-emerald-400" />
                  <h3 className="font-semibold">Incident Report</h3>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed mb-5">
                  Generate a tamper-evident audit report with SHA-256 verification and archive it under the 4 SentriX Archiving Principles.
                </p>

                <button
                  onClick={handleGenerateReport}
                  disabled={isArchiving}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-green-600 text-[#04140b] font-bold text-sm py-3 rounded-lg hover:opacity-90 transition shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                >
                  <Download size={16} />
                  {isArchiving ? "Archiving..." : "Generate & Archive Report"}
                </button>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
