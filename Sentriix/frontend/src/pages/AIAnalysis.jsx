import { useState } from "react";
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
} from "lucide-react";

import Sidebar from "../components/Sidebar";


/*
|--------------------------------------------------------------------------
| Temporary Frontend Incident Data
|--------------------------------------------------------------------------
| سيتم استبدال هذه البيانات لاحقًا بنتيجة الـ Backend / AI.
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| Local Storage
|--------------------------------------------------------------------------
*/

function getStoredIncidents() {
  try {
    return JSON.parse(
      localStorage.getItem("sentrix_incidents") || "[]"
    );
  } catch {
    return [];
  }
}


/*
|--------------------------------------------------------------------------
| Threat Category
|--------------------------------------------------------------------------
*/

const THREAT_CATEGORY = {
  Ransomware: "Malware",
  Malware: "Malware",
  Phishing: "Social Engineering",
  "Brute Force": "Credential Attack",
  "Insider Threat": "Internal Threat",
  DDoS: "Network Attack",
};


/*
|--------------------------------------------------------------------------
| Temporary AI Result
|--------------------------------------------------------------------------
*/

const TEMPORARY_AI_RESULT = {
  risk_detected: true,
  risk_score: 87,
};


/*
|--------------------------------------------------------------------------
| Key Findings
|--------------------------------------------------------------------------
*/

function generateFindings(incident) {
  return [
    `Suspicious activity related to ${
      incident.incident_type?.toLowerCase() || "unknown activity"
    } detected on ${incident.asset_type || "unknown asset"}.`,

    `Incident originated from source: ${
      incident.source || "Unknown"
    }.`,

    `Asset criticality classified as ${
      incident.asset_criticality || "Unknown"
    }.`,

    "Indicators of compromise (IOCs) are being cross-referenced with known threat patterns.",
  ];
}


/*
|--------------------------------------------------------------------------
| Severity Colors
|--------------------------------------------------------------------------
*/

const severityStyle = {
  Critical: "text-red-400",
  High: "text-orange-400",
  Medium: "text-amber-400",
  Low: "text-emerald-400",
  Informational: "text-gray-400",
};


/*
|--------------------------------------------------------------------------
| Info Row
|--------------------------------------------------------------------------
*/

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-white/5 last:border-0">

      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="text-sm text-gray-100 font-medium text-right max-w-[60%]">
        {value}
      </span>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| AI Analysis Page
|--------------------------------------------------------------------------
*/

export default function AIAnalysis() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | Get Incidents
  |--------------------------------------------------------------------------
  */

  const storedIncidents =
    getStoredIncidents();

  const allIncidents = [
    ...storedIncidents,
    ...MOCK_INCIDENTS,
  ];


  /*
  |--------------------------------------------------------------------------
  | Find Selected Incident
  |--------------------------------------------------------------------------
  */

  const incident =
    allIncidents.find(
      (inc) => inc.id === id
    );


  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {
    navigate("/login");
  };


  /*
  |--------------------------------------------------------------------------
  | Build AI Analysis
  |--------------------------------------------------------------------------
  */

  let analysis = null;


  if (incident) {

    const riskDetected =
      TEMPORARY_AI_RESULT.risk_detected;

    const riskScore =
      TEMPORARY_AI_RESULT.risk_score;


    /*
    |--------------------------------------------------------------------------
    | Severity
    |--------------------------------------------------------------------------
    */

    const severity =
      incident.severity ||
      incident.asset_criticality ||
      "Medium";


    analysis = {

      incident_id:
        incident.id,

      incident_title:
        incident.title,

      severity,

      time:
        incident.time ||
        incident.created_at ||
        "Not available",

      source:
        incident.source ||
        "Unknown",

      asset:
        `${incident.asset_type || "Unknown"}${
          incident.asset_criticality
            ? ` (${incident.asset_criticality} criticality)`
            : ""
        }`,


      /*
      |--------------------------------------------------------------------------
      | Threat
      |--------------------------------------------------------------------------
      */

      threat_type:
        incident.incident_type ||
        "Unknown",

      threat_category:
        THREAT_CATEGORY[
          incident.incident_type
        ] ||
        "Uncategorized",


      /*
      |--------------------------------------------------------------------------
      | Risk
      |--------------------------------------------------------------------------
      */

      risk_detected:
        riskDetected,

      risk_score:
        riskDetected
          ? riskScore
          : null,


      /*
      |--------------------------------------------------------------------------
      | Analysis Information
      |--------------------------------------------------------------------------
      */

      analysis_id:
        `AI-ANL-${incident.id.replace(
          "INC-",
          ""
        )}`,

      model_used:
        "SentriX Threat Intelligence Model v2.1",

      analysis_time:
        new Date().toLocaleString(
          "en-US",
          {
            dateStyle: "medium",
            timeStyle: "short",
          }
        ),

      data_sources:
        `${incident.source || "Unknown"}, Threat Intel, Behavioral Logs`,


      /*
      |--------------------------------------------------------------------------
      | MITRE ATT&CK
      |--------------------------------------------------------------------------
      */

      mitre_tactics:
        "Impact, Execution, Defense Evasion",

      attack_technique:
        "T1486, T1070, T1059",


      /*
      |--------------------------------------------------------------------------
      | Findings
      |--------------------------------------------------------------------------
      */

      key_findings:
        generateFindings(incident),

    };

  }


  return (

    <div className="min-h-screen bg-[#070b16] text-[#eef5f1] flex">


      {/* =========================================================
          UNIFIED SIDEBAR
      ========================================================= */}

      <Sidebar />


      {/* =========================================================
          MAIN
      ========================================================= */}

      <div className="flex-1 flex flex-col">


        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="flex items-center justify-between px-8 py-4 border-b border-white/10 relative">


          <Link
            to="/incidents"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200"
          >

            <ArrowLeft
              size={16}
            />

            Back to Incidents

          </Link>


          {/* User */}

          <div className="relative border-l border-white/10 pl-4">

            <button
              onClick={() =>
                setUserMenuOpen(
                  (prev) => !prev
                )
              }
              className="flex items-center gap-2"
            >

              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                A
              </div>


              <div className="text-xs text-left">

                <p className="font-semibold">
                  Analyst
                </p>

                <p className="text-gray-500">
                  SOC Analyst
                </p>

              </div>


              <ChevronDown
                size={14}
                className={`text-gray-500 transition-transform ${
                  userMenuOpen
                    ? "rotate-180"
                    : ""
                }`}
              />

            </button>


            {userMenuOpen && (

              <div className="absolute right-0 top-full mt-2 w-40 bg-[#0c1220] border border-white/10 rounded-lg shadow-lg overflow-hidden z-10">

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition"
                >

                  <LogOut
                    size={14}
                  />

                  Logout

                </button>

              </div>

            )}

          </div>

        </header>


        {/* =====================================================
            CONTENT
        ===================================================== */}

        <main className="flex-1 overflow-y-auto p-8 space-y-6">


          {/* ===================================================
              NO INCIDENT
          =================================================== */}

          {!analysis ? (

            <div className="bg-[#0c1220] border border-white/10 rounded-2xl p-10 text-center">

              <Sparkles
                size={32}
                className="text-emerald-400 mx-auto mb-4"
              />


              <h2 className="text-lg font-bold mb-2">
                No Incident Selected
              </h2>


              <p className="text-sm text-gray-400 mb-6">

                Please select an incident from the
                Incidents page to view its AI analysis.

              </p>


              <Link
                to="/incidents"
                className="inline-block bg-gradient-to-r from-emerald-400 to-green-600 text-[#04140b] font-bold px-6 py-2.5 rounded-lg hover:opacity-90 transition text-sm"
              >

                Go to Incidents

              </Link>

            </div>

          ) : (

            <>


              {/* ===================================================
                  PAGE TITLE
              =================================================== */}

              <div>

                <h1 className="text-2xl font-bold">
                  AI Analysis
                </h1>

                <p className="text-gray-400 text-sm">

                  AI-driven analysis for the selected incident

                </p>

              </div>


              {/* ===================================================
                  INCIDENT SUMMARY
              =================================================== */}

              <div className="bg-[#0c1220] border border-white/10 rounded-xl p-5 flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center text-red-400">

                    <ShieldAlert
                      size={20}
                    />

                  </div>


                  <div>

                    <p className="font-semibold">
                      {analysis.incident_id}
                    </p>


                    <p className="text-sm text-gray-400">
                      {analysis.incident_title}
                    </p>


                    <p className="text-xs text-gray-600 mt-1">

                      {analysis.time}

                      &nbsp;•&nbsp;

                      {analysis.source}

                      &nbsp;•&nbsp;

                      {analysis.asset}

                    </p>

                  </div>

                </div>


                <span className="flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-full text-xs font-semibold">

                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />

                  {analysis.severity}

                </span>

              </div>


              {/* ===================================================
                  THREAT / RISK / SEVERITY
              =================================================== */}

              <div className="grid grid-cols-3 gap-4">


                {/* THREAT TYPE */}

                <div className="bg-[#0c1220] border border-white/10 rounded-xl p-6 flex flex-col items-center text-center">

                  <p className="text-sm font-semibold text-gray-300 mb-3">
                    Threat Type
                  </p>


                  <div className="w-12 h-12 rounded-full bg-purple-500/15 flex items-center justify-center text-purple-400 mb-3">

                    <Bug
                      size={22}
                    />

                  </div>


                  <p className="text-lg font-bold text-purple-300">

                    {analysis.threat_type}

                  </p>


                  <p className="text-xs text-gray-500">

                    {analysis.threat_category}

                  </p>

                </div>


                {/* RISK */}

                <div className="bg-[#0c1220] border border-white/10 rounded-xl p-6 flex flex-col items-center text-center">

                  <p className="text-sm font-semibold text-gray-300 mb-3">
                    Risk Assessment
                  </p>


                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                      analysis.risk_detected
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-emerald-500/15 text-emerald-400"
                    }`}
                  >

                    <Gauge
                      size={22}
                    />

                  </div>


                  {analysis.risk_detected ? (

                    <>

                      <p className="text-lg font-bold text-amber-400">

                        {analysis.risk_score}
                        {" "}
                        / 100

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

                      <p className="text-lg font-bold text-emerald-400">
                        No Risk Detected
                      </p>


                      <p className="text-xs text-gray-500">
                        No significant security risk identified
                      </p>

                    </>

                  )}

                </div>


                {/* SEVERITY */}

                <div className="bg-[#0c1220] border border-white/10 rounded-xl p-6 flex flex-col items-center text-center">

                  <p className="text-sm font-semibold text-gray-300 mb-3">
                    Severity
                  </p>


                  <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center text-red-400 mb-3">

                    <ShieldAlert
                      size={22}
                    />

                  </div>


                  <p
                    className={`text-lg font-bold ${
                      severityStyle[
                        analysis.severity
                      ] ||
                      "text-gray-300"
                    }`}
                  >

                    {analysis.severity}

                  </p>


                  <p className="text-xs text-gray-500">

                    {analysis.risk_detected

                      ? analysis.severity ===
                          "Critical" ||
                        analysis.severity ===
                          "High"

                        ? "Immediate Action Required"

                        : "Monitor and Review"

                      : "No Risk Identified"}

                  </p>

                </div>

              </div>


              {/* ===================================================
                  NO RISK MESSAGE
              =================================================== */}

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

                        The AI analysis did not identify a
                        significant security risk in this incident.
                        No risk-based recommendations are required.

                      </p>

                    </div>

                  </div>

                </div>

              )}


              {/* ===================================================
                  AI SUMMARY
              =================================================== */}

              <div className="bg-[#0c1220] border border-white/10 rounded-xl p-6">


                <div className="flex items-center gap-2 mb-4">

                  <ListChecks
                    size={16}
                    className="text-emerald-400"
                  />

                  <h2 className="text-sm font-semibold text-gray-200">
                    AI Analysis Summary
                  </h2>

                </div>


                <div className="grid grid-cols-2 gap-8">


                  {/* LEFT */}

                  <div>

                    <InfoRow
                      label="Analysis ID"
                      value={
                        analysis.analysis_id
                      }
                    />


                    <InfoRow
                      label="Model Used"
                      value={
                        analysis.model_used
                      }
                    />


                    <InfoRow
                      label="Analysis Time"
                      value={
                        analysis.analysis_time
                      }
                    />


                    <InfoRow
                      label="Data Sources"
                      value={
                        analysis.data_sources
                      }
                    />


                    <InfoRow
                      label="MITRE ATT&CK Tactics"
                      value={
                        analysis.mitre_tactics
                      }
                    />


                    <InfoRow
                      label="Attack Technique"
                      value={
                        analysis.attack_technique
                      }
                    />

                  </div>


                  {/* RIGHT */}

                  <div>

                    <p className="text-sm font-semibold text-gray-300 mb-3">
                      Key Findings
                    </p>


                    <ul className="space-y-2.5">

                      {analysis.key_findings.map(
                        (finding, i) => (

                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-gray-300"
                          >

                            <CheckCircle2
                              size={16}
                              className="text-emerald-400 shrink-0 mt-0.5"
                            />

                            {finding}

                          </li>

                        )
                      )}

                    </ul>

                  </div>

                </div>

              </div>


              {/* ===================================================
                  RISK RECOMMENDATIONS
              =================================================== */}

              {analysis.risk_detected && (

                <div className="text-center">

                  <Link
                    to={`/recommendations/${id}`}
                    className="inline-flex items-center gap-2 border-2 border-dashed border-emerald-500/40 text-emerald-400 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-500/5 transition"
                  >

                    View Recommendations →

                  </Link>


                  <p className="text-xs text-gray-600 mt-2">

                    View AI recommendations based on this incident's risk score

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