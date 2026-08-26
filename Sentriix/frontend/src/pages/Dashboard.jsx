import React, { useEffect, useMemo, useState } from "react";
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
import { apiService } from "../services/api";


/* =========================================================
   CONSTANTS
========================================================= */

const SEVERITY_PRIORITY = {
  Critical: 3,
  High: 2,
  Medium: 1,
  Low: 0,
};

const SEVERITY_STYLE = {
  Critical:
    "bg-red-500/10 text-red-400 border-red-500/30",

  High:
    "bg-orange-500/10 text-orange-400 border-orange-500/30",

  Medium:
    "bg-amber-500/10 text-amber-400 border-amber-500/30",

  Low:
    "bg-gray-500/10 text-gray-400 border-gray-500/30",
};

const ATTACK_COLORS = [
  "#f97316",
  "#ef4444",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#9ca3af",
];


/* =========================================================
   HELPERS
========================================================= */

function readNumber(...values) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }
  }

  return null;
}


/* =========================================================
   DASHBOARD TOTALS
========================================================= */

function extractDashboardTotals(statsData) {
  const totals = statsData?.totals || {};
  const severityCounts =
    statsData?.severityCounts || {};

  return {
    total: readNumber(
      totals.total,
      totals.totalIncidents,
      totals.incidents,
      statsData?.total,
      statsData?.totalIncidents
    ),

    critical: readNumber(
      totals.critical,
      totals.criticalIncidents,
      severityCounts.Critical,
      severityCounts.critical,
      statsData?.critical,
      statsData?.criticalIncidents
    ),

    analyzed: readNumber(
      totals.analyzed,
      totals.analyzedIncidents,
      statsData?.analyzed,
      statsData?.analyzedIncidents
    ),

    pending: readNumber(
      totals.pending,
      totals.pendingAnalysis,
      statsData?.pending,
      statsData?.pendingAnalysis
    ),
  };
}


/* =========================================================
   ATTACK TYPES
========================================================= */

function normalizeAttackTypes(list) {
  if (!Array.isArray(list)) {
    return [];
  }

  const total = list.reduce(
    (sum, item) =>
      sum + Number(item?.value || 0),
    0
  );

  return list.map((item, index) => ({
    name:
      item?.name ||
      item?.type ||
      item?.attack_type ||
      "Unknown",

    value: Number(
      item?.value || 0
    ),

    percent:
      total > 0
        ? Math.round(
            (Number(item?.value || 0) /
              total) *
              100
          )
        : 0,

    color:
      item?.color ||
      ATTACK_COLORS[
        index % ATTACK_COLORS.length
      ],
  }));
}


/* =========================================================
   INCIDENT NORMALIZATION
========================================================= */

function normalizeIncidents(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item, index) => ({
    id: item?.id
      ? String(item.id).startsWith("INC")
        ? item.id
        : `INC-${String(item.id).padStart(
            4,
            "0"
          )}`
      : `INC-${index + 1}`,

    /*
     * SERVER VALUE ONLY
     * If backend does not provide a title,
     * show "—" instead of inventing one.
     */

    title:
      item?.title ??
      item?.threat_type ??
      item?.incident_type ??
      "—",

    /*
     * SERVER VALUE ONLY
     */

    severity:
      item?.severity ??
      "—",

    /*
     * SERVER VALUE ONLY
     */

    source:
      item?.source ??
      "—",

    time: item?.created_at
      ? new Date(
          item.created_at
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—",

    hasAiResult: Boolean(
      item?.ai_results ||
        item?.hasAiResult ||
        item?.ai_score ||
        item?.ai_analysis
    ),

    created_at:
      item?.created_at || null,
  }));
}


/* =========================================================
   TREND DATA
========================================================= */

function normalizeTrendData(trends) {
  if (!trends) {
    return [];
  }

  let source = null;

  if (Array.isArray(trends)) {
    source = trends;

  } else if (
    Array.isArray(trends.hourly)
  ) {
    source = trends.hourly;

  } else if (
    Array.isArray(trends.data)
  ) {
    source = trends.data;

  } else if (
    Array.isArray(trends.incidents)
  ) {
    source = trends.incidents;

  } else if (
    Array.isArray(trends.overTime)
  ) {
    source = trends.overTime;
  }

  if (!source) {
    return [];
  }

  return source
    .map((item, index) => ({
      hour:
        item?.hour ??
        item?.label ??
        item?.time ??
        item?.date ??
        `${index + 1}`,

      count: Number(
        item?.count ??
          item?.value ??
          item?.total ??
          item?.incidents ??
          0
      ),
    }))
    .filter(
      (item) =>
        item.hour !== undefined &&
        item.hour !== null
    );
}


/* =========================================================
   TREND VALUE
========================================================= */

function getTrendValue(
  trends,
  key
) {
  const trend =
    trends?.[key];

  if (
    trend === undefined ||
    trend === null
  ) {
    return "—";
  }

  if (
    typeof trend === "object"
  ) {
    return (
      trend.change ??
      trend.value ??
      "—"
    );
  }

  return trend;
}


/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const [
    incidentsList,
    setIncidentsList,
  ] = useState([]);

  const [
    dashboardStats,
    setDashboardStats,
  ] = useState(null);

  const [
    attackTypes,
    setAttackTypes,
  ] = useState([]);

  const [
    trends,
    setTrends,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);


  /* =======================================================
     FETCH SERVER DATA ONLY
  ======================================================= */

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard =
      async () => {
        try {
          if (isMounted) {
            setError(null);
            setLoading(true);
          }

          /*
           * SERVER DATA ONLY
           *
           * No Mock Data
           * No localStorage
           * No fallback data
           */

          const [
            liveIncidents,
            statsData,
          ] = await Promise.all([
            apiService.getIncidents(),
            apiService.getDashboardStats(),
          ]);


          if (!isMounted) {
            return;
          }


          /* =================================================
             INCIDENTS
          ================================================= */

          if (
            Array.isArray(
              liveIncidents
            )
          ) {
            setIncidentsList(
              normalizeIncidents(
                liveIncidents
              )
            );

          } else if (
            Array.isArray(
              liveIncidents?.incidents
            )
          ) {
            setIncidentsList(
              normalizeIncidents(
                liveIncidents.incidents
              )
            );

          } else {
            setIncidentsList([]);
          }


          /* =================================================
             DASHBOARD STATS
          ================================================= */

          setDashboardStats(
            statsData || null
          );


          /* =================================================
             ATTACK TYPES
          ================================================= */

          setAttackTypes(
            normalizeAttackTypes(
              statsData?.attackTypes
            )
          );


          /* =================================================
             TRENDS
          ================================================= */

          /*
           * IMPORTANT:
           * Do NOT create fake trend values.
           *
           * If backend does not return trends,
           * the chart remains empty.
           */

          setTrends(
            statsData?.trends ||
            null
          );


          setLoading(false);

        } catch (err) {

          console.error(
            "Dashboard API Error:",
            err
          );


          if (!isMounted) {
            return;
          }


          /*
           * NO MOCK FALLBACK
           */

          setIncidentsList([]);
          setAttackTypes([]);
          setDashboardStats(null);
          setTrends(null);


          setError(
            err?.message ||
              "Unable to load dashboard data."
          );


          setLoading(false);
        }
      };


    fetchDashboard();


    /* =====================================================
       AUTO REFRESH
    ===================================================== */

    const interval =
      setInterval(
        fetchDashboard,
        5000
      );


    return () => {
      isMounted = false;
      clearInterval(interval);
    };

  }, []);


  /* =======================================================
     SORT INCIDENTS
  ======================================================= */

  const sortedIncidents =
    useMemo(
      () =>
        [...incidentsList].sort(
          (a, b) =>
            (
              SEVERITY_PRIORITY[
                b.severity
              ] || 0
            ) -
            (
              SEVERITY_PRIORITY[
                a.severity
              ] || 0
            )
        ),
      [incidentsList]
    );


  /* =======================================================
     DASHBOARD TOTALS
  ======================================================= */

  const totals =
    extractDashboardTotals(
      dashboardStats
    );


  const totalIncidents =
    totals.total ?? 0;

  const criticalCount =
    totals.critical ?? 0;

  const analyzedCount =
    totals.analyzed ?? 0;

  const pendingCount =
    totals.pending ?? 0;


  /* =======================================================
     ATTACK TOTAL
  ======================================================= */

  const attackTotal =
    attackTypes.reduce(
      (sum, item) =>
        sum +
        Number(
          item.value || 0
        ),
      0
    );


  /* =======================================================
     CHART
  ======================================================= */

  const lineData =
    normalizeTrendData(
      trends
    );


  /* =======================================================
     KPI DATA
  ======================================================= */

  const stats = [
    {
      label:
        "Total Incidents",

      value:
        totalIncidents,

      change:
        getTrendValue(
          trends,
          "total"
        ),

      positive:
        trends?.total?.positive ??
        true,

      icon:
        MessageSquare,

      color:
        "text-blue-400",

      bg:
        "bg-blue-500/10",
    },

    {
      label:
        "Critical Incidents",

      value:
        criticalCount,

      change:
        getTrendValue(
          trends,
          "critical"
        ),

      positive:
        trends?.critical?.positive ??
        false,

      icon:
        AlertCircle,

      color:
        "text-red-400",

      bg:
        "bg-red-500/10",
    },

    {
      label:
        "Analyzed Incidents",

      value:
        analyzedCount,

      change:
        getTrendValue(
          trends,
          "analyzed"
        ),

      positive:
        trends?.analyzed?.positive ??
        true,

      icon:
        CheckCircle2,

      color:
        "text-emerald-400",

      bg:
        "bg-emerald-500/10",
    },

    {
      label:
        "Pending Analysis",

      value:
        pendingCount,

      change:
        getTrendValue(
          trends,
          "pending"
        ),

      positive:
        trends?.pending?.positive ??
        false,

      icon:
        Clock,

      color:
        "text-amber-400",

      bg:
        "bg-amber-500/10",
    },
  ];


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div
        className="
          min-h-screen
          w-full

          bg-[#070b16]
          text-[#eef5f1]

          flex
          flex-col
          lg:flex-row

          overflow-x-hidden
        "
      >

        <Sidebar />

        <main
          className="
            flex-1
            min-w-0

            flex
            items-center
            justify-center

            p-4
            sm:p-6
          "
        >

          <div
            className="
              text-center
              text-gray-400

              max-w-xs
            "
          >

            <div
              className="
                w-8
                h-8

                border-2
                border-emerald-400
                border-t-transparent

                rounded-full

                animate-spin

                mx-auto
                mb-3
              "
            />

            <p className="text-sm">
              Loading dashboard data...
            </p>

          </div>

        </main>

      </div>
    );
  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div
        className="
          min-h-screen
          w-full

          bg-[#070b16]
          text-[#eef5f1]

          flex
          flex-col
          lg:flex-row

          overflow-x-hidden
        "
      >

        <Sidebar />

        <main
          className="
            flex-1
            min-w-0

            flex
            items-center
            justify-center

            p-4
            sm:p-6
          "
        >

          <div
            className="
              w-full
              max-w-md

              bg-[#0c1220]

              border
              border-red-500/20

              rounded-2xl

              p-5
              sm:p-6

              text-center
            "
          >

            <AlertCircle
              className="
                text-red-400
                mx-auto
                mb-3
              "
              size={32}
            />

            <h2
              className="
                font-semibold
                mb-2
              "
            >
              Unable to load dashboard
            </h2>

            <p
              className="
                text-sm
                text-gray-500

                break-words

                leading-relaxed
              "
            >
              {error}
            </p>

          </div>

        </main>

      </div>
    );
  }


  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="
        min-h-screen
        w-full

        bg-[#070b16]
        text-[#eef5f1]

        flex
        flex-col
        lg:flex-row

        overflow-x-hidden
      "
    >

      <Sidebar />


      <div
        className="
          flex-1

          flex
          flex-col

          min-w-0

          overflow-x-hidden
        "
      >

        <main
          className="
            flex-1

            overflow-y-auto
            overflow-x-hidden

            p-3
            min-[360px]:p-4
            sm:p-5
            md:p-6
            lg:p-8

            space-y-4
            sm:space-y-5
            lg:space-y-6

            pb-8

            min-w-0
          "
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              flex

              flex-col
              sm:flex-row

              sm:items-center
              sm:justify-between

              gap-2

              min-w-0
            "
          >

            <div
              className="
                min-w-0
              "
            >

              <h1
                className="
                  text-xl
                  min-[360px]:text-2xl
                  sm:text-3xl

                  font-bold

                  leading-tight
                "
              >
                Dashboard
              </h1>

              <p
                className="
                  text-gray-400

                  text-xs
                  sm:text-sm

                  mt-1

                  leading-relaxed
                "
              >
                Overview of your security environment
              </p>

            </div>

          </div>


          {/* =================================================
              KPI CARDS
          ================================================= */}

          <div
            className="
              grid

              grid-cols-1
              min-[360px]:grid-cols-2
              lg:grid-cols-4

              gap-2
              min-[360px]:gap-3
              sm:gap-4

              min-w-0
            "
          >

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
                  className="
                    bg-[#0c1220]

                    border
                    border-white/10

                    rounded-xl

                    p-3
                    min-[360px]:p-3.5
                    sm:p-5
                    md:p-6

                    min-w-0

                    overflow-hidden
                  "
                >

                  <div
                    className="
                      flex

                      items-center
                      justify-between

                      gap-2

                      mb-3
                    "
                  >

                    <div
                      className={`
                        w-8
                        h-8

                        min-[360px]:w-9
                        min-[360px]:h-9

                        sm:w-11
                        sm:h-11

                        rounded-full

                        ${bg}

                        flex
                        items-center
                        justify-center

                        shrink-0
                      `}
                    >

                      <Icon
                        size={
                          window.innerWidth <
                          480
                            ? 17
                            : 20
                        }
                        className={
                          color
                        }
                      />

                    </div>


                    <span
                      className={`
                        text-[10px]
                        min-[360px]:text-[11px]
                        sm:text-xs

                        font-semibold

                        whitespace-nowrap

                        ${
                          positive
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      `}
                    >

                      {positive
                        ? "↑"
                        : "↓"}{" "}

                      {change}

                    </span>

                  </div>


                  <p
                    className="
                      text-[11px]
                      min-[360px]:text-xs
                      sm:text-sm

                      text-gray-400

                      mb-1

                      truncate
                    "
                  >
                    {label}
                  </p>


                  <p
                    className="
                      text-xl
                      min-[360px]:text-2xl
                      sm:text-3xl

                      font-bold

                      truncate
                    "
                  >
                    {value}
                  </p>

                </div>

              )
            )}

          </div>


          {/* =================================================
              CHARTS
          ================================================= */}

          <div
            className="
              grid

              grid-cols-1

              lg:grid-cols-3

              gap-3
              sm:gap-4

              min-w-0
            "
          >

            {/* =================================================
                INCIDENTS OVER TIME
            ================================================= */}

            <div
              className="
                lg:col-span-2

                bg-[#0c1220]

                border
                border-white/10

                rounded-xl

                p-3
                sm:p-4

                min-w-0

                overflow-hidden
              "
            >

              <div
                className="
                  flex

                  items-center
                  justify-between

                  gap-2

                  mb-3
                "
              >

                <h2
                  className="
                    font-semibold

                    text-xs
                    sm:text-sm

                    truncate
                  "
                >
                  Incidents Over Time
                </h2>

              </div>


              {lineData.length ===
              0 ? (

                <div
                  className="
                    h-[170px]
                    min-[360px]:h-[180px]
                    sm:h-[210px]

                    flex
                    items-center
                    justify-center

                    text-xs
                    sm:text-sm

                    text-gray-600

                    text-center

                    px-4
                  "
                >
                  No trend data available.
                </div>

              ) : (

                <div
                  className="
                    w-full

                    min-w-0

                    h-[170px]
                    min-[360px]:h-[180px]
                    sm:h-[210px]
                    md:h-[230px]
                  "
                >

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <LineChart
                      data={
                        lineData
                      }
                      margin={{
                        top: 5,
                        right:
                          window.innerWidth <
                          480
                            ? 0
                            : 5,
                        left:
                          window.innerWidth <
                          480
                            ? -18
                            : -10,
                        bottom: 0,
                      }}
                    >

                      <CartesianGrid
                        stroke="#1a2233"
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="hour"
                        stroke="#6b7280"

                        fontSize={
                          window.innerWidth <
                          480
                            ? 8
                            : 9
                        }

                        interval={
                          window.innerWidth <
                          480
                            ? "preserveStartEnd"
                            : 2
                        }

                        tickLine={false}
                        axisLine={false}
                      />

                      <YAxis
                        stroke="#6b7280"
                        fontSize={9}

                        allowDecimals={
                          false
                        }

                        width={
                          window.innerWidth <
                          480
                            ? 28
                            : 35
                        }

                        tickLine={false}
                        axisLine={false}
                      />

                      <Tooltip
                        contentStyle={{
                          background:
                            "#0c1220",
                          border:
                            "1px solid #1a2233",
                          fontSize: 12,
                          borderRadius: 8,
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#34e08a"
                        strokeWidth={2}

                        dot={{
                          r:
                            window.innerWidth <
                            480
                              ? 2
                              : 2.5,
                        }}

                        activeDot={{
                          r: 4,
                        }}
                      />

                    </LineChart>

                  </ResponsiveContainer>

                </div>

              )}

            </div>


            {/* =================================================
                TOP ATTACK TYPES
            ================================================= */}

            <div
              className="
                bg-[#0c1220]

                border
                border-white/10

                rounded-xl

                p-3
                sm:p-4

                min-w-0

                overflow-hidden
              "
            >

              <h2
                className="
                  font-semibold

                  text-xs
                  sm:text-sm

                  mb-2
                "
              >
                Top Attack Types
              </h2>


              {attackTypes.length ===
              0 ? (

                <div
                  className="
                    h-[230px]
                    sm:h-[260px]

                    flex
                    items-center
                    justify-center

                    text-xs
                    sm:text-sm

                    text-gray-600

                    text-center
                  "
                >
                  No attack type data available.
                </div>

              ) : (

                <>

                  <div
                    className="
                      relative

                      flex
                      items-center
                      justify-center

                      h-32
                      min-[360px]:h-36
                      sm:h-40

                      w-full
                    "
                  >

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <PieChart>

                        <Pie
                          data={
                            attackTypes
                          }

                          dataKey="value"

                          innerRadius={
                            window.innerWidth <
                            480
                              ? 30
                              : 34
                          }

                          outerRadius={
                            window.innerWidth <
                            480
                              ? 47
                              : 52
                          }

                          paddingAngle={2}
                        >

                          {attackTypes.map(
                            (entry) => (

                              <Cell
                                key={
                                  entry.name
                                }
                                fill={
                                  entry.color
                                }
                              />

                            )
                          )}

                        </Pie>

                      </PieChart>

                    </ResponsiveContainer>


                    <div
                      className="
                        absolute

                        text-center

                        pointer-events-none
                      "
                    >

                      <p
                        className="
                          text-base
                          sm:text-lg

                          font-bold
                        "
                      >
                        {attackTotal}
                      </p>

                      <p
                        className="
                          text-[9px]
                          sm:text-[10px]

                          text-gray-500
                        "
                      >
                        Total
                      </p>

                    </div>

                  </div>


                  <div
                    className="
                      space-y-2

                      mt-3
                    "
                  >

                    {attackTypes.map(
                      (item) => (

                        <div
                          key={
                            item.name
                          }
                          className="
                            flex

                            items-center
                            justify-between

                            gap-2

                            text-[11px]
                            sm:text-xs
                          "
                        >

                          <span
                            className="
                              flex
                              items-center

                              gap-2

                              text-gray-400

                              min-w-0
                            "
                          >

                            <span
                              className="
                                w-2
                                h-2

                                rounded-full

                                shrink-0
                              "
                              style={{
                                background:
                                  item.color,
                              }}
                            />

                            <span
                              className="
                                truncate
                              "
                            >
                              {
                                item.name
                              }
                            </span>

                          </span>


                          <span
                            className="
                              text-gray-300

                              whitespace-nowrap

                              shrink-0
                            "
                          >

                            {
                              item.value
                            }{" "}

                            (
                            {
                              item.percent
                            }%)

                          </span>

                        </div>

                      )
                    )}

                  </div>

                </>

              )}

            </div>

          </div>


          {/* =================================================
              INCIDENTS TABLE
          ================================================= */}

          <div
            className="
              bg-[#0c1220]

              border
              border-white/10

              rounded-xl

              p-3
              sm:p-5

              min-w-0

              overflow-hidden
            "
          >

            <div
              className="
                flex

                flex-col
                sm:flex-row

                sm:items-center
                sm:justify-between

                gap-2

                mb-4
              "
            >

              <h2
                className="
                  font-semibold
                  text-sm
                "
              >
                Incidents
              </h2>


              <Link
                to="/incidents"
                className="
                  text-xs
                  text-emerald-400

                  hover:underline

                  w-fit
                "
              >
                View all incidents
              </Link>

            </div>


            {sortedIncidents.length ===
            0 ? (

              <div
                className="
                  py-10

                  text-center

                  text-sm

                  text-gray-600
                "
              >
                No incidents available.
              </div>

            ) : (

              <div
                className="
                  overflow-x-auto

                  -mx-3
                  px-3

                  sm:mx-0
                  sm:px-0

                  overscroll-x-contain
                "
              >

                <table
                  className="
                    w-full

                    text-xs
                    sm:text-sm

                    min-w-[640px]
                  "
                >

                  <thead>

                    <tr
                      className="
                        text-left

                        text-gray-500

                        text-[10px]
                        sm:text-xs

                        border-b
                        border-white/10
                      "
                    >

                      <th
                        className="
                          pb-2
                          pr-4

                          font-normal
                        "
                      >
                        ID
                      </th>

                      <th
                        className="
                          pb-2
                          pr-4

                          font-normal
                        "
                      >
                        Title
                      </th>

                      <th
                        className="
                          pb-2
                          pr-4

                          font-normal
                        "
                      >
                        Severity
                      </th>

                      <th
                        className="
                          pb-2
                          pr-4

                          font-normal
                        "
                      >
                        Analysis
                      </th>

                      <th
                        className="
                          pb-2
                          pr-4

                          font-normal
                        "
                      >
                        Source
                      </th>

                      <th
                        className="
                          pb-2

                          font-normal
                        "
                      >
                        Time
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {sortedIncidents.map(
                      (incident) => (

                        <tr
                          key={
                            incident.id
                          }
                          className="
                            border-b
                            border-white/5
                          "
                        >

                          <td
                            className="
                              py-3
                              pr-4

                              text-gray-300

                              whitespace-nowrap
                            "
                          >
                            {
                              incident.id
                            }
                          </td>


                          <td
                            className="
                              py-3
                              pr-4

                              max-w-[260px]
                            "
                          >

                            <span
                              className="
                                block

                                truncate
                              "
                              title={
                                incident.title
                              }
                            >
                              {
                                incident.title
                              }
                            </span>

                          </td>


                          <td
                            className="
                              py-3
                              pr-4

                              whitespace-nowrap
                            "
                          >

                            <span
                              className={`
                                text-[10px]
                                sm:text-xs

                                px-2
                                py-0.5

                                rounded-full

                                border

                                ${
                                  SEVERITY_STYLE[
                                    incident.severity
                                  ] ||
                                  "bg-gray-500/10 text-gray-400 border-gray-500/30"
                                }
                              `}
                            >
                              {
                                incident.severity
                              }
                            </span>

                          </td>


                          <td
                            className="
                              py-3
                              pr-4

                              whitespace-nowrap
                            "
                          >

                            {incident.hasAiResult ? (

                              <span
                                className="
                                  text-xs
                                  text-emerald-400
                                "
                              >
                                Analyzed
                              </span>

                            ) : (

                              <span
                                className="
                                  text-xs
                                  text-amber-400
                                "
                              >
                                Pending
                              </span>

                            )}

                          </td>


                          <td
                            className="
                              py-3
                              pr-4

                              text-gray-400

                              whitespace-nowrap
                            "
                          >
                            {
                              incident.source
                            }
                          </td>


                          <td
                            className="
                              py-3

                              text-gray-500

                              whitespace-nowrap
                            "
                          >
                            {
                              incident.time
                            }
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </main>

      </div>

    </div>
  );
}