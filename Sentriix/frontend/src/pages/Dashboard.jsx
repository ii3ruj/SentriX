import {
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import Sidebar from "../components/Sidebar";


/* ================= بيانات وهمية (Mock Data) — بتنستبدل بالـ API لاحقًا ================= */

const attackTypes = [
  {
    name: "Ransomware",
    value: 34,
    percent: 27,
    color: "#f97316",
  },

  {
    name: "Phishing",
    value: 30,
    percent: 23,
    color: "#ef4444",
  },

  {
    name: "Malware",
    value: 26,
    percent: 20,
    color: "#22c55e",
  },

  {
    name: "Brute Force",
    value: 20,
    percent: 16,
    color: "#06b6d4",
  },

  {
    name: "Insider Threat",
    value: 12,
    percent: 9,
    color: "#3b82f6",
  },

  {
    name: "Other",
    value: 6,
    percent: 5,
    color: "#9ca3af",
  },
];


const attackTotal =
  attackTypes.reduce(
    (sum, t) => sum + t.value,
    0
  );


const SEVERITY_PRIORITY = {
  Critical: 3,
  High: 2,
  Medium: 1,
  Low: 0,
};


const severityStyle = {
  Critical:
    "bg-red-500/10 text-red-400 border-red-500/30",

  High:
    "bg-orange-500/10 text-orange-400 border-orange-500/30",

  Medium:
    "bg-amber-500/10 text-amber-400 border-amber-500/30",

  Low:
    "bg-gray-500/10 text-gray-400 border-gray-500/30",
};


/*
|--------------------------------------------------------------------------
| Incidents
|--------------------------------------------------------------------------
|
| hasAiResult يمثل:
| هل فيه صف مرتبط بجدول ai_results لهذي الحادثة
| يعني تحللت؟
|
*/

const rawIncidents = [

  {
    id: "INC-0001",
    title: "Ransomware detected on Server-01",
    severity: "Critical",
    source: "EDR",
    time: "10m ago",
    hasAiResult: true,
    created_at: new Date().toISOString(),
  },

  {
    id: "INC-0002",
    title: "Unusual login from foreign location",
    severity: "High",
    source: "SIEM",
    time: "45m ago",
    hasAiResult: true,
    created_at: new Date(
      Date.now() -
        1000 * 60 * 60 * 24
    ).toISOString(),
  },

  {
    id: "INC-0003",
    title: "Multiple failed login attempts",
    severity: "Medium",
    source: "AD",
    time: "1h ago",
    hasAiResult: false,
    created_at: new Date(
      Date.now() -
        1000 *
          60 *
          60 *
          24 *
          3
    ).toISOString(),
  },

];


/*
|--------------------------------------------------------------------------
| الفرز حسب الأهمية
|--------------------------------------------------------------------------
*/

const incidents = [
  ...rawIncidents,
].sort(
  (a, b) =>
    SEVERITY_PRIORITY[b.severity] -
    SEVERITY_PRIORITY[a.severity]
);


/*
|--------------------------------------------------------------------------
| Statistics
|--------------------------------------------------------------------------
*/

const analyzedCount =
  incidents.filter(
    (i) => i.hasAiResult
  ).length;


const pendingCount =
  incidents.filter(
    (i) => !i.hasAiResult
  ).length;


const criticalCount =
  incidents.filter(
    (i) =>
      i.severity === "Critical"
  ).length;


const stats = [

  {
    label: "Total Incidents",
    value: incidents.length,
    change: "18%",
    positive: true,
    icon: MessageSquare,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },

  {
    label: "Critical Incidents",
    value: criticalCount,
    change: "7%",
    positive: false,
    icon: AlertCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },

  {
    label: "Analyzed Incidents",
    value: analyzedCount,
    change: "12%",
    positive: true,
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },

  {
    label: "Pending Analysis",
    value: pendingCount,
    change: "4%",
    positive: false,
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },

];


/*
|--------------------------------------------------------------------------
| Incidents Over Time
|--------------------------------------------------------------------------
*/

function getTodayHourlyData(list) {

  const todayKey =
    new Date()
      .toISOString()
      .split("T")[0];


  const hours = [];


  for (
    let h = 0;
    h < 24;
    h++
  ) {

    const label =
      h === 0
        ? "12 AM"
        : h < 12
        ? `${h} AM`
        : h === 12
        ? "12 PM"
        : `${h - 12} PM`;


    const count =
      list.filter((inc) => {

        const incDate =
          new Date(
            inc.created_at
          );

        return (
          inc.created_at.startsWith(
            todayKey
          ) &&
          incDate.getHours() === h
        );

      }).length;


    hours.push({
      hour: label,
      count,
    });

  }


  return hours;
}


const lineData =
  getTodayHourlyData(
    incidents
  );


/* ================= الصفحة ================= */

export default function Dashboard() {

  return (

    <div className="min-h-screen bg-[#070b16] text-[#eef5f1] flex">


      {/* =========================================================
          UNIFIED SIDEBAR
      ========================================================= */}

      <Sidebar />


      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}

      <div className="flex-1 flex flex-col">


        {/* =======================================================
            CONTENT
        ======================================================= */}

        <main className="flex-1 overflow-y-auto p-8 space-y-6">


          {/* =====================================================
              TITLE
          ===================================================== */}

          <div>

            <h1 className="text-2xl font-bold">
              Dashboard
            </h1>

            <p className="text-gray-400 text-sm">
              Overview of your security environment
            </p>

          </div>


          {/* =====================================================
              STAT CARDS
          ===================================================== */}

          <div className="grid grid-cols-4 gap-4">

            {stats.map(
              ({
                label,
                value,
                change,
                positive,
                icon: Icon,
                color,
                bg,
              }) => (

                <div
                  key={label}
                  className="bg-[#0c1220] border border-white/10 rounded-xl p-6"
                >

                  <div className="flex items-center justify-between mb-3">

                    <div
                      className={`w-11 h-11 rounded-full ${bg} flex items-center justify-center`}
                    >

                      <Icon
                        size={20}
                        className={color}
                      />

                    </div>


                    <span
                      className={`text-xs font-semibold ${
                        positive
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >

                      ↑ {change}

                    </span>

                  </div>


                  <p className="text-sm text-gray-400 mb-1">
                    {label}
                  </p>


                  <div className="flex items-end justify-between">

                    <p className="text-3xl font-bold">
                      {value}
                    </p>

                    <p className="text-[11px] text-gray-600 mb-1">
                      vs last week
                    </p>

                  </div>

                </div>

              )
            )}

          </div>


          {/* =====================================================
              CHARTS
          ===================================================== */}

          <div className="grid grid-cols-3 gap-4">


            {/* ===================================================
                INCIDENTS OVER TIME
            =================================================== */}

            <div className="col-span-2 bg-[#0c1220] border border-white/10 rounded-xl p-4">

              <h2 className="font-semibold text-sm mb-2">
                Incidents Over Time
              </h2>


              <ResponsiveContainer
                width="100%"
                height={160}
              >

                <LineChart
                  data={lineData}
                >

                  <CartesianGrid
                    stroke="#1a2233"
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="hour"
                    stroke="#6b7280"
                    fontSize={11}
                    interval={2}
                  />

                  <YAxis
                    stroke="#6b7280"
                    fontSize={11}
                    allowDecimals={false}
                  />

                  <Tooltip
                    contentStyle={{
                      background:
                        "#0c1220",
                      border:
                        "1px solid #1a2233",
                      fontSize: 12,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#34e08a"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>


            {/* ===================================================
                TOP ATTACK TYPES
            =================================================== */}

            <div className="bg-[#0c1220] border border-white/10 rounded-xl p-4">

              <h2 className="font-semibold text-sm mb-2">
                Top Attack Types
              </h2>


              <div className="relative flex items-center justify-center h-28">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={attackTypes}
                      dataKey="value"
                      innerRadius={38}
                      outerRadius={55}
                      paddingAngle={2}
                    >

                      {attackTypes.map(
                        (entry) => (

                          <Cell
                            key={entry.name}
                            fill={entry.color}
                          />

                        )
                      )}

                    </Pie>

                  </PieChart>

                </ResponsiveContainer>


                <div className="absolute text-center">

                  <p className="text-lg font-bold">
                    {attackTotal}
                  </p>

                  <p className="text-[10px] text-gray-500">
                    Total
                  </p>

                </div>

              </div>


              <div className="space-y-1.5 mt-3">

                {attackTypes.map(
                  (t) => (

                    <div
                      key={t.name}
                      className="flex items-center justify-between text-xs"
                    >

                      <span className="flex items-center gap-2 text-gray-400">

                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            background:
                              t.color,
                          }}
                        />

                        {t.name}

                      </span>


                      <span className="text-gray-300">

                        {t.value} (
                        {t.percent}
                        %)

                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>


          {/* =====================================================
              INCIDENTS TABLE
          ===================================================== */}

          <div className="bg-[#0c1220] border border-white/10 rounded-xl p-5">

            <div className="flex items-center justify-between mb-4">

              <h2 className="font-semibold text-sm">
                Incidents
              </h2>


              <Link
                to="/incidents"
                className="text-xs text-emerald-400 hover:underline"
              >
                View all incidents
              </Link>

            </div>


            <table className="w-full text-sm">

              <thead>

                <tr className="text-left text-gray-500 text-xs border-b border-white/10">

                  <th className="pb-2 font-normal">
                    ID
                  </th>

                  <th className="pb-2 font-normal">
                    Title
                  </th>

                  <th className="pb-2 font-normal">
                    Severity
                  </th>

                  <th className="pb-2 font-normal">
                    Analysis
                  </th>

                  <th className="pb-2 font-normal">
                    Source
                  </th>

                  <th className="pb-2 font-normal">
                    Time
                  </th>

                </tr>

              </thead>


              <tbody>

                {incidents.map(
                  (inc) => (

                    <tr
                      key={inc.id}
                      className="border-b border-white/5"
                    >

                      <td className="py-2.5 text-gray-300">
                        {inc.id}
                      </td>


                      <td className="py-2.5">
                        {inc.title}
                      </td>


                      <td className="py-2.5">

                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${severityStyle[inc.severity]}`}
                        >

                          {inc.severity}

                        </span>

                      </td>


                      <td className="py-2.5">

                        {inc.hasAiResult ? (

                          <span className="text-xs text-emerald-400">
                            Analyzed
                          </span>

                        ) : (

                          <span className="text-xs text-amber-400">
                            Pending
                          </span>

                        )}

                      </td>


                      <td className="py-2.5 text-gray-400">
                        {inc.source}
                      </td>


                      <td className="py-2.5 text-gray-500">
                        {inc.time}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>


        </main>

      </div>

    </div>

  );
}