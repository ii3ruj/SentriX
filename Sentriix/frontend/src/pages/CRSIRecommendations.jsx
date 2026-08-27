import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  Gauge,
  FileText,
  ShieldCheck,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { apiService } from "../services/api";

const DEFAULT_BREAKDOWN = [
  { name: "Identify & Access", score: 68 },
  { name: "Network Security", score: 72 },
  { name: "Endpoint Security", score: 64 },
  { name: "Detect & Respond", score: 68 },
  { name: "Backup & Recovery", score: 60 },
  { name: "NCA Controls", score: 70 },
];

const DEFAULT_RECOMMENDATIONS = [
  {
    id: 1,
    title: "Review endpoint protection coverage",
    description: "Review endpoint security coverage and identify systems that are not adequately protected.",
    priority: "High",
    status: "Pending",
  },
  {
    id: 2,
    title: "Investigate unresolved endpoint alerts",
    description: "Review unresolved endpoint security alerts and determine whether additional investigation is required.",
    priority: "High",
    status: "Pending",
  },
  {
    id: 3,
    title: "Update endpoint security controls",
    description: "Review and strengthen endpoint security controls across organizational assets.",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: 4,
    title: "Review endpoint configuration",
    description: "Assess endpoint configurations and identify security weaknesses that may reduce the organization's security posture.",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: 5,
    title: "Verify security monitoring coverage",
    description: "Verify that critical endpoints are properly monitored and security events are being collected.",
    priority: "Medium",
    status: "Pending",
  },
];

export default function CRSIRecommendations() {
  const navigate = useNavigate();

  const [securityScore, setSecurityScore] = useState(0);
  const [maturityLevel, setMaturityLevel] = useState(null);
  const [breakdown, setBreakdown] = useState(DEFAULT_BREAKDOWN);
  const [recommendations, setRecommendations] = useState(DEFAULT_RECOMMENDATIONS);
  const [recommendedPlaybook, setRecommendedPlaybook] = useState("ENDPOINT_SECURITY_PLAYBOOK");

  useEffect(() => {
    let isMounted = true;

    const fetchCRSIInfo = async () => {
      try {
        const crsiData = await apiService.getCRSIRecommendations();
        if (isMounted && crsiData) {
          if (typeof crsiData.score === "number") setSecurityScore(crsiData.score);
          if (crsiData.maturity_level) setMaturityLevel(crsiData.maturity_level);
          if (Array.isArray(crsiData.breakdown)) setBreakdown(crsiData.breakdown);
          if (crsiData.playbook) setRecommendedPlaybook(crsiData.playbook);
          if (Array.isArray(crsiData.actions)) setRecommendations(crsiData.actions);
        }
      } catch (err) {
        console.warn("Using fallback CRSI recommendations:", err);
      }
    };

    fetchCRSIInfo();
    const interval = setInterval(fetchCRSIInfo, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
    const confirmed = window.confirm(
      `Generate and archive the CRSI assessment report?\n\n` +
        `Security score: ${securityScore}/100\n` +
        `Maturity level: ${maturityLevel || "-"}\n\n` +
        `The report is archived as an immutable snapshot with a SHA-256 fingerprint.`
    );
    if (!confirmed) return;

    try {
      // يُخزَّن فعلياً في الباك إند (سجل archives + لقطة مجمّدة)
      const result = await apiService.archiveCRSIReport();
      const row = result?.archived;

      window.alert(
        row
          ? `CRSI report archived.\n\n` +
            `Report ID: ${row.report_id}\n` +
            `SHA-256: ${String(row.sha256 || "").slice(0, 32)}...\n` +
            `Archived by: ${row.archived_by}\n` +
            `Retention until: ${row.retention_until}`
          : "CRSI report archived."
      );

      navigate("/archive");
    } catch (e) {
      window.alert(`Could not archive the CRSI report: ${e.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b16] text-[#eef5f1] flex">
      {/* UNIFIED SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="flex-1 min-w-0">
        {/* HEADER */}
        <header className="px-8 py-7 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate("/crsi-assessment")}
              className="text-gray-500 hover:text-emerald-400 transition"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="text-sm text-emerald-400">CRSI</span>
          </div>

          <h1 className="text-3xl font-bold">Security Recommendations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Recommendations generated from the organization's security score and score breakdown.
          </p>
        </header>

        {/* CONTENT */}
        <div className="p-8 max-w-[1250px] mx-auto">
          {/* SECURITY SCORE SUMMARY */}
          <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-6 mb-5">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-2">Security Score</p>
                <p
                  className={`text-3xl font-bold ${
                    securityScore >= 70
                      ? "text-emerald-400"
                      : securityScore >= 40
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {securityScore}
                  <span className="text-sm text-gray-500"> / 100</span>
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Security Posture</p>
                <p
                  className={`text-lg font-semibold ${
                    securityScore >= 70
                      ? "text-emerald-400"
                      : securityScore >= 40
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {maturityLevel ||
                    (securityScore >= 80
                      ? "Strong"
                      : securityScore >= 60
                      ? "Moderate"
                      : securityScore >= 40
                      ? "Weak"
                      : "Critical")}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Recommendation Source</p>
                <p className="text-sm text-gray-300">CRSI Resilience & NCA Engine</p>
              </div>
            </div>
          </section>

          {/* TWO COLUMNS */}
          <div className="grid lg:grid-cols-[1fr_300px] gap-5">
            {/* LEFT COLUMN */}
            <div className="space-y-5">
              {/* PLAYBOOK */}
              <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <BookOpen size={21} className="text-purple-400" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Recommended Playbook</p>
                    <h2 className="text-purple-400 font-bold text-base">{recommendedPlaybook}</h2>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      This playbook is selected based on the lowest score indicators in your organization's resilience profile.
                    </p>
                  </div>
                </div>
              </section>

              {/* ACTIONS */}
              <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-semibold">Recommended Actions</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Actions recommended to improve the organization's security posture.
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">{recommendations.length} actions</span>
                </div>

                <div className="space-y-3">
                  {recommendations.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#070b16] border border-white/5 rounded-xl p-4 hover:border-emerald-500/20 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-6 text-xs text-gray-500 font-semibold">{item.id}.</div>

                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-200">{item.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                        </div>

                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-full font-semibold shrink-0 ${getPriorityStyle(
                            item.priority
                          )}`}
                        >
                          {item.priority}
                        </span>

                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-full font-semibold shrink-0 ${getStatusStyle(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* GENERATE REPORT */}
              <section className="bg-[#0c1220] border border-emerald-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <FileText size={21} className="text-emerald-400" />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-gray-200">Generate CRSI Audit Report</h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Generate and cryptographically archive this CRSI security recommendations report.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateReport}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-green-600 text-[#04140b] font-bold text-sm px-5 py-3 rounded-lg hover:opacity-90 transition shrink-0 shadow-lg shadow-emerald-500/10"
                  >
                    <FileText size={17} />
                    Generate Report
                  </button>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-5">
              {/* BREAKDOWN */}
              <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-5">
                  <Gauge size={17} className="text-emerald-400" />
                  <h3 className="font-semibold text-sm">Score Breakdown</h3>
                </div>

                <div className="space-y-5">
                  {breakdown.map((item) => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">{item.name}</span>
                        <span className="text-xs font-semibold">{item.score}</span>
                      </div>

                      <div className="h-1.5 bg-[#172130] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.score >= 70
                              ? "bg-emerald-500"
                              : item.score >= 40
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* STATUS */}
              <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock3 size={16} className="text-emerald-400" />
                  <h3 className="font-semibold text-sm">Recommendation Status</h3>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span>Recommendations calculated & synced</span>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
