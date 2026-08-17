import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { apiService } from "../services/api";

const MOCK_INCIDENTS = [
  {
    id: "INC-0001",
    title: "Ransomware detected on Server-01",
    source: "EDR",
    incident_type: "Ransomware",
    source_ip: "45.33.12.8",
    destination_ip: "192.168.1.35",
    asset_type: "Server",
    asset_criticality: "Critical",
    description:
      "Ransomware behavior detected. File encryption attempts blocked. Process injection detected.",
    time: "2026-05-26 10:32:15 AM",
    created_by: "analyst@gmail.com",
  },
  {
    id: "INC-0002",
    title: "Unusual login from foreign location",
    source: "SIEM",
    incident_type: "Brute Force",
    source_ip: "88.21.5.19",
    destination_ip: "10.0.0.12",
    asset_type: "Workstation",
    asset_criticality: "Medium",
    description:
      "Multiple failed login attempts from an unrecognized IP address.",
    time: "2026-05-25 03:14:02 PM",
    created_by: "analyst@gmail.com",
  },
  {
    id: "INC-0003",
    title: "Multiple failed login attempts",
    source: "AD",
    incident_type: "Brute Force",
    source_ip: "102.44.7.19",
    destination_ip: "10.0.0.21",
    asset_type: "Workstation",
    asset_criticality: "Medium",
    description:
      "Repeated failed authentication attempts detected against a domain account.",
    time: "2026-05-25 09:10:00 AM",
    created_by: "analyst@gmail.com",
  },
  {
    id: "INC-0004",
    title: "Data exfiltration attempt blocked",
    source: "DLP",
    incident_type: "Insider Threat",
    source_ip: "10.0.0.44",
    destination_ip: "77.12.90.3",
    asset_type: "Database",
    asset_criticality: "High",
    description:
      "Large volume of sensitive data transfer to an external IP was blocked by policy.",
    time: "2026-05-25 06:40:00 AM",
    created_by: "analyst@gmail.com",
  },
  {
    id: "INC-0005",
    title: "Brute force attack detected",
    source: "Firewall",
    incident_type: "Brute Force",
    source_ip: "203.0.113.5",
    destination_ip: "10.0.0.8",
    asset_type: "Network Device",
    asset_criticality: "High",
    description:
      "High-frequency login attempts detected from a single external source.",
    time: "2026-05-24 18:05:00 PM",
    created_by: "analyst@gmail.com",
  },
  {
    id: "INC-0006",
    title: "Suspicious file execution",
    source: "Firewall",
    incident_type: "Malware",
    source_ip: "10.0.0.15",
    destination_ip: null,
    asset_type: "Workstation",
    asset_criticality: "Low",
    description:
      "An unrecognized executable file was run on an endpoint device.",
    time: "2026-05-23 11:20:00 AM",
    created_by: "analyst@gmail.com",
  },
  {
    id: "INC-0007",
    title: "Phishing email detected",
    source: "EDR",
    incident_type: "Phishing",
    source_ip: null,
    destination_ip: null,
    asset_type: "Workstation",
    asset_criticality: "Medium",
    description:
      "A phishing email containing a malicious link was reported by a user and quarantined.",
    time: "2026-05-23 08:15:00 AM",
    created_by: "analyst@gmail.com",
  },
  {
    id: "INC-0008",
    title: "Privilege escalation attempt",
    source: "SIEM",
    incident_type: "Insider Threat",
    source_ip: "10.0.0.9",
    destination_ip: "10.0.0.2",
    asset_type: "Server",
    asset_criticality: "High",
    description:
      "A standard user account attempted to gain administrator-level privileges.",
    time: "2026-05-22 14:30:00 PM",
    created_by: "analyst@gmail.com",
  },
  {
    id: "INC-0009",
    title: "Malware communication blocked",
    source: "XDR",
    incident_type: "Malware",
    source_ip: "10.0.0.30",
    destination_ip: "198.51.100.7",
    asset_type: "Server",
    asset_criticality: "Critical",
    description:
      "Outbound connection to a known command-and-control server was blocked.",
    time: "2026-05-22 09:00:00 AM",
    created_by: "analyst@gmail.com",
  },
  {
    id: "INC-0010",
    title: "Unauthorized access to database",
    source: "Proxy",
    incident_type: "Insider Threat",
    source_ip: "10.0.0.18",
    destination_ip: "10.0.0.50",
    asset_type: "Database",
    asset_criticality: "Critical",
    description:
      "An account outside of normal working hours accessed a restricted database instance.",
    time: "2026-05-21 22:50:00 PM",
    created_by: "analyst@gmail.com",
  },
];

function getStoredIncidents() {
  try {
    return JSON.parse(localStorage.getItem("sentrix_incidents") || "[]");
  } catch {
    return [];
  }
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-100 font-medium text-right max-w-[60%]">
        {value || <span className="text-gray-600 italic">Not provided</span>}
      </span>
    </div>
  );
}

export default function IncidentDetail() {
  const { id } = useParams();
  const [liveIncident, setLiveIncident] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDetail = async () => {
      if (!id) return;
      try {
        const data = await apiService.getIncidentById(id).catch(() => null);
        if (isMounted && data) {
          setLiveIncident(data);
        }
      } catch (err) {
        console.warn("Using fallback incident details:", err);
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const storedIncidents = getStoredIncidents();
  const allIncidents = [
    ...(liveIncident ? [liveIncident] : []),
    ...storedIncidents,
    ...MOCK_INCIDENTS,
  ];

  const incident = allIncidents.find((inc) => inc.id === id);

  return (
    <div className="min-h-screen bg-[#070b16] text-[#eef5f1] flex">
      {/* ================= UNIFIED SIDEBAR ================= */}
      <Sidebar />

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col">
        {/* ================= HEADER ================= */}
        <header className="flex items-center px-8 py-4 border-b border-white/10">
          <Link
            to="/incidents"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200"
          >
            <ArrowLeft size={16} />
            Back to Incidents
          </Link>
        </header>

        {/* ================= CONTENT ================= */}
        <main className="flex-1 overflow-y-auto p-8 max-w-3xl space-y-6">
          {!incident ? (
            <div className="bg-[#0c1220] border border-white/10 rounded-2xl p-8 text-center text-gray-400">
              Incident <span className="text-emerald-400 font-mono">{id}</span> not found.
            </div>
          ) : (
            <>
              {/* INCIDENT TITLE */}
              <div>
                <p className="text-sm text-gray-500 mb-1 font-mono">{incident.id}</p>
                <h1 className="text-2xl font-bold">{incident.title}</h1>
              </div>

              {/* INCIDENT INFORMATION */}
              <div className="bg-[#0c1220] border border-white/10 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-300 mb-2">
                  Incident Information
                </h2>

                <InfoRow label="Source" value={incident.source} />
                <InfoRow
                  label="Incident Type"
                  value={incident.incident_type || incident.threat_type}
                />
                <InfoRow
                  label="Time"
                  value={incident.time || incident.actual_incident_time || incident.created_at}
                />
                <InfoRow label="Source IP" value={incident.source_ip} />
                <InfoRow label="Destination IP" value={incident.destination_ip} />
                <InfoRow
                  label="Asset Type"
                  value={incident.asset_type || incident.affected_asset}
                />
                <InfoRow
                  label="Asset Criticality"
                  value={incident.asset_criticality || incident.severity}
                />
                <InfoRow label="Logged By" value={incident.created_by} />

                {/* Description */}
                <div className="pt-4 mt-2 border-t border-white/5">
                  <h2 className="text-sm font-semibold text-gray-300 mb-2">
                    Description
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {incident.description || (
                      <span className="italic text-gray-600">
                        No description provided.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* NOTE */}
              <p className="text-xs text-gray-600 italic">
                Some fields will be auto-filled from AI analysis results once available. Archived data can be found under the Archive page.
              </p>

              {/* PROCEED TO AI ANALYSIS */}
              <Link
                to={`/ai-analysis/${incident.id}`}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-green-600 text-[#04140b] font-bold py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-emerald-500/10"
              >
                <Sparkles size={18} />
                Proceed to AI Analysis
              </Link>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
