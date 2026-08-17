import React, { useState, useEffect } from "react";
import {
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { apiService } from "../services/api";

/*
|--------------------------------------------------------------------------
| Temporary Raw Incidents Fallback
|--------------------------------------------------------------------------
*/
const rawIncidents = [
  {
    id: "INC-0001",
    title: "Ransomware detected on Server-01",
    severity: "Critical",
    status: "Open",
    source: "EDR",
    time: "10m ago",
  },
  {
    id: "INC-0002",
    title: "Unusual login from foreign location",
    severity: "High",
    status: "Open",
    source: "SIEM",
    time: "45m ago",
  },
  {
    id: "INC-0003",
    title: "Multiple failed login attempts",
    severity: "Medium",
    status: "Investigating",
    source: "AD",
    time: "1h ago",
  },
  {
    id: "INC-0004",
    title: "Data exfiltration attempt blocked",
    severity: "High",
    status: "Open",
    source: "DLP",
    time: "3h ago",
  },
  {
    id: "INC-0005",
    title: "Brute force attack detected",
    severity: "High",
    status: "Resolved",
    source: "Firewall",
    time: "16h ago",
  },
  {
    id: "INC-0006",
    title: "Suspicious file execution",
    severity: "Low",
    status: "Closed",
    source: "Firewall",
    time: "2d ago",
  },
  {
    id: "INC-0007",
    title: "Phishing email detected",
    severity: "High",
    status: "Open",
    source: "EDR",
    time: "2d ago",
  },
  {
    id: "INC-0008",
    title: "Privilege escalation attempt",
    severity: "Medium",
    status: "Investigating",
    source: "SIEM",
    time: "3d ago",
  },
  {
    id: "INC-0009",
    title: "Malware communication blocked",
    severity: "Critical",
    status: "Open",
    source: "XDR",
    time: "3d ago",
  },
  {
    id: "INC-0010",
    title: "Unauthorized access to database",
    severity: "High",
    status: "Open",
    source: "Proxy",
    time: "4d ago",
  },
];

function getStoredIncidents() {
  try {
    return JSON.parse(localStorage.getItem("sentrix_incidents") || "[]");
  } catch {
    return [];
  }
}

const severityStyle = {
  Critical: "bg-red-500/10 text-red-400 border-red-500/30",
  High: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

const statusStyle = {
  Open: "text-emerald-400",
  Investigating: "text-blue-400",
  Resolved: "text-emerald-400",
  Closed: "text-gray-400",
};

export default function Incidents() {
  const [liveIncidents, setLiveIncidents] = useState([]);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const fetchIncidents = async () => {
      try {
        const data = await apiService.getIncidents();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((item, idx) => ({
            id: item.id ? (String(item.id).startsWith("INC") ? item.id : `INC-${String(item.id).padStart(4, "0")}`) : `INC-${idx + 1}`,
            title: item.title || item.threat_type || "Security Incident",
            severity: item.severity || "Medium",
            status: item.status || "Open",
            source: item.source || "System",
            time: item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
          }));
          setLiveIncidents(formatted);
        }
      } catch (err) {
        console.warn("Using fallback stored incidents:", err);
      }
    };

    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const storedIncidents = getStoredIncidents();
  
  // دمج البيانات الحية أو المحلية مع البيانات الاحتياطية
  const allIncidents = liveIncidents.length > 0 
    ? liveIncidents 
    : [...storedIncidents].reverse().concat(rawIncidents);

  const uniqueSources = [
    "All",
    ...new Set(allIncidents.map((incident) => incident.source || "System")),
  ];

  const filtered = allIncidents.filter((incident) => {
    const matchesSearch =
      (incident.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (incident.id || "").toLowerCase().includes(search.toLowerCase());

    const matchesSeverity =
      severityFilter === "All" || incident.severity === severityFilter;

    const matchesStatus =
      statusFilter === "All" || incident.status === statusFilter;

    const matchesSource =
      sourceFilter === "All" || incident.source === sourceFilter;

    return matchesSearch && matchesSeverity && matchesStatus && matchesSource;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedIncidents = filtered.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="min-h-screen bg-[#070b16] text-[#eef5f1] flex">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Incidents</h1>
              <p className="text-gray-400 text-sm">
                View all incidents and filter
              </p>
            </div>

            {/* NEW INCIDENT BUTTON */}
            <Link
              to="/new-incident"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-green-600 text-[#04140b] font-bold px-4 py-2.5 rounded-lg hover:opacity-90 transition text-sm"
            >
              <Plus size={16} />
              New Incident
            </Link>
          </div>

          {/* FILTERS */}
          <div className="bg-[#0c1220] border border-white/10 rounded-xl p-4 flex flex-wrap items-center gap-3">
            {/* SEARCH */}
            <div className="flex items-center gap-2 bg-[#070b16] border border-white/10 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search incidents..."
                className="w-full bg-transparent outline-none text-sm placeholder:text-gray-600"
              />
            </div>

            {/* SEVERITY */}
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#070b16] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
            >
              <option value="All">Severity: All</option>
              {Object.keys(severityStyle).map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>

            {/* STATUS */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#070b16] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
            >
              <option value="All">Status: All</option>
              {Object.keys(statusStyle).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            {/* SOURCE */}
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#070b16] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
            >
              {uniqueSources.map((source) => (
                <option key={source} value={source}>
                  {source === "All" ? "Source: All" : source}
                </option>
              ))}
            </select>
          </div>

          {/* TABLE */}
          <div className="bg-[#0c1220] border border-white/10 rounded-xl p-5">
            <table className="w-full text-sm">
              {/* TABLE HEADER */}
              <thead>
                <tr className="text-left text-gray-500 text-xs border-b border-white/10">
                  <th className="pb-2 font-normal">ID</th>
                  <th className="pb-2 font-normal">Title</th>
                  <th className="pb-2 font-normal">Severity</th>
                  <th className="pb-2 font-normal">Status</th>
                  <th className="pb-2 font-normal">Source</th>
                  <th className="pb-2 font-normal">Time</th>
                  <th className="pb-2 font-normal text-right">Actions</th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody>
                {paginatedIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition"
                  >
                    {/* ID */}
                    <td className="py-2.5 text-gray-300 font-mono text-xs">
                      {incident.id}
                    </td>

                    {/* TITLE */}
                    <td className="py-2.5 font-medium">
                      {incident.title}
                    </td>

                    {/* SEVERITY */}
                    <td className="py-2.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          severityStyle[incident.severity] || severityStyle.Low
                        }`}
                      >
                        {incident.severity}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td
                      className={`py-2.5 text-xs font-semibold ${
                        statusStyle[incident.status] || "text-gray-400"
                      }`}
                    >
                      {incident.status}
                    </td>

                    {/* SOURCE */}
                    <td className="py-2.5 text-gray-400 text-xs">
                      {incident.source}
                    </td>

                    {/* TIME */}
                    <td className="py-2.5 text-gray-500 text-xs">
                      {incident.time}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-4">
                        {/* VIEW */}
                        <Link
                          to={`/incidents/${incident.id}`}
                          className="inline-flex flex-col items-center gap-0.5 text-emerald-400 hover:text-emerald-300 transition"
                          title="View Incident"
                        >
                          <span className="text-[10px]">View</span>
                          <Eye size={16} />
                        </Link>

                        {/* TEAM */}
                        <Link
                          to={`/team-connection?type=incident&id=${incident.id}`}
                          className="inline-flex flex-col items-center gap-0.5 text-blue-400 hover:text-blue-300 transition"
                          title="Send to Team"
                        >
                          <span className="text-[10px]">Team</span>
                          <Users size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* EMPTY STATE */}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No incidents match your search or filter criteria.
              </div>
            )}

            {/* PAGINATION */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 text-xs text-gray-500">
              <span>
                Showing {filtered.length > 0 ? startIndex + 1 : 0} to{" "}
                {Math.min(startIndex + rowsPerPage, filtered.length)} of{" "}
                {filtered.length} incidents
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 hover:text-gray-300 disabled:opacity-40 disabled:hover:text-gray-500"
                >
                  <ChevronLeft size={14} />
                </button>

                <span className="w-6 h-6 flex items-center justify-center rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {currentPage}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 hover:text-gray-300 disabled:opacity-40 disabled:hover:text-gray-500"
                >
                  <ChevronRight size={14} />
                </button>

                <span className="ml-3">Rows per page:</span>

                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#070b16] border border-white/10 rounded px-2 py-1 text-gray-300 outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
