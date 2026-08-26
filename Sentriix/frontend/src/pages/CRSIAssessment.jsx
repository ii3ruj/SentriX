import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Gauge,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Lightbulb,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import { apiService } from "../services/api";


/* =========================================================
   SCORE STATUS
========================================================= */

function getScoreStatus(score) {
  if (score >= 80) {
    return {
      label: "Excellent",
      className: "text-emerald-400",
    };
  }

  if (score >= 60) {
    return {
      label: "Good",
      className: "text-emerald-400",
    };
  }

  if (score >= 40) {
    return {
      label: "Moderate",
      className: "text-yellow-400",
    };
  }

  return {
    label: "Critical",
    className: "text-red-400",
  };
}


/* =========================================================
   NORMALIZE DAILY HISTORY
   API DATA ONLY
========================================================= */

function normalizeDailyScores(data) {
  const source =
    Array.isArray(data?.daily_scores)
      ? data.daily_scores
      : Array.isArray(data?.dailyScores)
      ? data.dailyScores
      : Array.isArray(data?.history)
      ? data.history
      : Array.isArray(data?.daily_history)
      ? data.daily_history
      : [];

  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map((item) => {
      const score =
        item?.score ??
        item?.crsi_score ??
        item?.security_score ??
        item?.value;

      if (
        score === undefined ||
        score === null ||
        score === ""
      ) {
        return null;
      }

      const numericScore = Number(score);

      return {
        date:
          item?.date ||
          item?.day ||
          item?.created_at ||
          "Unknown date",

        score: numericScore,

        status:
          item?.status ||
          getScoreStatus(
            numericScore
          ).label,

        maturity_level:
          item?.maturity_level ??
          item?.maturityLevel ??
          null,

        incident_count:
          item?.incident_count ??
          item?.incidentCount ??
          item?.incidents ??
          0,

        breakdown:
          Array.isArray(item?.breakdown)
            ? item.breakdown
            : [],
      };
    })
    .filter(Boolean);
}


/* =========================================================
   NORMALIZE BREAKDOWN
========================================================= */

function normalizeBreakdown(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => ({
      name:
        item?.name ||
        item?.category ||
        item?.control ||
        item?.domain ||
        "Unknown",

      score: Number(
        item?.score ??
          item?.value ??
          item?.security_score ??
          0
      ),
    }))
    .filter(
      (item) =>
        item.name &&
        !Number.isNaN(item.score)
    );
}


/* =========================================================
   CRSI ASSESSMENT
========================================================= */

export default function CRSIAssessment() {
  const navigate = useNavigate();

  const [dailyScores, setDailyScores] =
    useState([]);

  const [selectedDay, setSelectedDay] =
    useState(null);

  const [breakdown, setBreakdown] =
    useState([]);

  const [maturityLevel, setMaturityLevel] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);


  /* =======================================================
     FETCH SERVER DATA ONLY
  ======================================================= */

  useEffect(() => {
    let isMounted = true;

    const fetchCRSI = async () => {
      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        const data =
          await apiService.getCRSIPosture();

        if (!isMounted) {
          return;
        }


        /* =================================================
           DAILY HISTORY
        ================================================= */

        const history =
          normalizeDailyScores(data);

        setDailyScores(history);

        if (history.length > 0) {
          setSelectedDay(
            history[0]
          );
        } else {
          setSelectedDay(null);
        }


        /* =================================================
           BREAKDOWN
        ================================================= */

        setBreakdown(
          normalizeBreakdown(
            data?.breakdown
          )
        );


        /* =================================================
           MATURITY
        ================================================= */

        setMaturityLevel(
          data?.maturity_level ??
            data?.maturityLevel ??
            null
        );


        setLoading(false);

      } catch (err) {
        console.error(
          "CRSI Assessment API Error:",
          err
        );

        if (!isMounted) {
          return;
        }

        /*
         * NO MOCK DATA
         * NO LOCALSTORAGE FALLBACK
         */

        setDailyScores([]);
        setSelectedDay(null);
        setBreakdown([]);
        setMaturityLevel(null);

        setError(
          err?.message ||
            "Unable to load CRSI assessment data."
        );

        setLoading(false);
      }
    };


    fetchCRSI();


    /*
     * Refresh from backend every 30 seconds.
     */

    const interval =
      setInterval(
        fetchCRSI,
        30000
      );


    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);


  /* =======================================================
     CURRENT BREAKDOWN
  ======================================================= */

  const dayBreakdown =
    selectedDay?.breakdown?.length > 0
      ? normalizeBreakdown(
          selectedDay.breakdown
        )
      : breakdown;


  /* =======================================================
     SCORE
  ======================================================= */

  const currentScore =
    Number(
      selectedDay?.score ?? 0
    );


  const scoreStatus =
    getScoreStatus(
      currentScore
    );


  /* =======================================================
     PREVIOUS DAY
  ======================================================= */

  const selectedIndex =
    dailyScores.findIndex(
      (day) =>
        day.date ===
        selectedDay?.date
    );


  const previousDay =
    selectedIndex >= 0 &&
    dailyScores[
      selectedIndex + 1
    ]
      ? dailyScores[
          selectedIndex + 1
        ]
      : null;


  const scoreDifference =
    previousDay
      ? Number(
          (
            currentScore -
            Number(
              previousDay.score
            )
          ).toFixed(1)
        )
      : null;


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <PageShell>
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
          <div className="text-center">
            <Loader2
              size={32}
              className="
                animate-spin
                text-emerald-400
                mx-auto
                mb-3
              "
            />

            <p
              className="
                text-sm
                text-gray-400
              "
            >
              Loading CRSI assessment...
            </p>
          </div>
        </main>
      </PageShell>
    );
  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <PageShell>
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
              size={32}
              className="
                text-red-400
                mx-auto
                mb-3
              "
            />

            <h2
              className="
                font-semibold
                mb-2
              "
            >
              Unable to load CRSI assessment
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
      </PageShell>
    );
  }


  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (
    !selectedDay &&
    dailyScores.length === 0
  ) {
    return (
      <PageShell>
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
              border-white/10

              rounded-2xl

              p-5
              sm:p-6

              text-center
            "
          >
            <Gauge
              size={32}
              className="
                text-emerald-400
                mx-auto
                mb-3
              "
            />

            <h2
              className="
                font-semibold
                mb-2
              "
            >
              No CRSI assessment data
            </h2>

            <p
              className="
                text-sm
                text-gray-500

                leading-relaxed
              "
            >
              No security posture assessment
              has been returned by the server yet.
            </p>
          </div>
        </main>
      </PageShell>
    );
  }


  /* =======================================================
     UI
  ======================================================= */

  return (
    <PageShell>

      <main
        className="
          flex-1
          min-w-0

          overflow-x-hidden
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            px-4
            sm:px-5
            md:px-8

            py-5
            sm:py-6
            md:py-7

            border-b
            border-white/10
          "
        >
          <div
            className="
              flex
              items-center

              gap-2

              mb-2
            "
          >
            <Gauge
              size={20}
              className="
                text-emerald-400
                shrink-0
              "
            />

            <span
              className="
                text-sm
                text-emerald-400
                font-medium
              "
            >
              CRSI Assessment
            </span>
          </div>


          <h1
            className="
              text-2xl
              sm:text-3xl

              font-bold

              leading-tight
            "
          >
            CRSI Assessment
          </h1>


          <p
            className="
              text-sm
              text-gray-500

              mt-1

              max-w-3xl

              leading-relaxed
            "
          >
            Daily assessment of the organization's
            overall security posture and cyber resilience index.
          </p>
        </header>


        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            p-4
            sm:p-5
            md:p-8

            max-w-[1250px]

            mx-auto

            w-full

            min-w-0
          "
        >

          {/* =================================================
              DATE SELECTOR
          ================================================= */}

          <div
            className="
              flex

              flex-col
              sm:flex-row

              sm:items-center
              sm:justify-between

              gap-4

              mb-6
            "
          >

            <div className="min-w-0">

              <p
                className="
                  text-xs
                  text-gray-500

                  mb-1
                "
              >
                Security score for
              </p>

              <div
                className="
                  flex
                  items-center

                  gap-2
                "
              >
                <CalendarDays
                  size={17}
                  className="
                    text-emerald-400
                    shrink-0
                  "
                />

                <span
                  className="
                    font-semibold
                    break-words
                  "
                >
                  {selectedDay.date}
                </span>
              </div>

            </div>


            {dailyScores.length > 0 && (
              <select
                value={
                  selectedDay.date
                }
                onChange={(e) => {
                  const selected =
                    dailyScores.find(
                      (day) =>
                        day.date ===
                        e.target.value
                    );

                  if (selected) {
                    setSelectedDay(
                      selected
                    );
                  }
                }}
                className="
                  bg-[#0c1220]

                  border
                  border-white/10

                  rounded-lg

                  px-3
                  sm:px-4

                  py-2.5

                  text-sm
                  text-gray-300

                  outline-none

                  w-full
                  sm:w-auto

                  max-w-full
                "
              >
                {dailyScores.map(
                  (day) => (
                    <option
                      key={day.date}
                      value={day.date}
                      className="
                        bg-[#0c1220]
                      "
                    >
                      {day.date}
                    </option>
                  )
                )}
              </select>
            )}

          </div>


          {/* =================================================
              SCORE + BREAKDOWN
          ================================================= */}

          <div
            className="
              grid

              grid-cols-1
              lg:grid-cols-2

              gap-4
              sm:gap-5

              mb-6
            "
          >

            {/* =================================================
                OVERALL SCORE
            ================================================= */}

            <section
              className="
                bg-[#0c1220]

                border
                border-white/10

                rounded-2xl

                p-5
                sm:p-6
                md:p-7

                min-w-0
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between

                  gap-4

                  mb-5
                "
              >

                <div className="min-w-0">

                  <h2
                    className="
                      text-lg
                      sm:text-xl

                      font-semibold
                    "
                  >
                    Overall Security Score
                  </h2>

                  <p
                    className="
                      text-xs
                      text-gray-500

                      mt-1
                    "
                  >
                    Organization-wide security posture score
                  </p>

                </div>


                <div
                  className="
                    w-10
                    h-10

                    rounded-xl

                    bg-emerald-500/10

                    flex
                    items-center
                    justify-center

                    shrink-0
                  "
                >
                  <ShieldCheck
                    size={20}
                    className="
                      text-emerald-400
                    "
                  />
                </div>

              </div>


              <div
                className="
                  flex
                  justify-center

                  py-2
                  sm:py-5

                  overflow-hidden
                "
              >
                <ScoreCircle
                  score={
                    currentScore
                  }
                />
              </div>


              <div className="text-center">

                <p
                  className={`
                    text-lg
                    sm:text-xl

                    font-semibold

                    ${scoreStatus.className}
                  `}
                >
                  {selectedDay.maturity_level ||
                    maturityLevel ||
                    scoreStatus.label}
                </p>

                <p
                  className="
                    text-xs
                    text-gray-500

                    mt-2

                    leading-relaxed
                  "
                >
                  Resilience level for{" "}
                  {selectedDay.date}
                  {" · "}
                  {selectedDay.incident_count ??
                    0}{" "}
                  incident(s) that day
                </p>

              </div>


              {scoreDifference !== null && (
                <div
                  className="
                    flex
                    justify-center

                    mt-5
                  "
                >
                  <div
                    className={`
                      flex
                      items-center

                      gap-2

                      text-xs

                      px-3
                      py-2

                      rounded-lg

                      text-center

                      ${
                        scoreDifference >= 0
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }
                    `}
                  >

                    {scoreDifference >= 0 ? (
                      <ArrowUpRight
                        size={15}
                      />
                    ) : (
                      <ArrowDownRight
                        size={15}
                      />
                    )}

                    <span>
                      {Math.abs(
                        scoreDifference
                      )}{" "}
                      points compared with previous day
                    </span>

                  </div>
                </div>
              )}

            </section>


            {/* =================================================
                BREAKDOWN
            ================================================= */}

            <section
              className="
                bg-[#0c1220]

                border
                border-white/10

                rounded-2xl

                p-5
                sm:p-6
                md:p-7

                min-w-0
              "
            >

              <div className="mb-6">

                <h2
                  className="
                    text-lg
                    sm:text-xl

                    font-semibold
                  "
                >
                  Score Breakdown
                </h2>

                <p
                  className="
                    text-xs
                    text-gray-500

                    mt-1

                    leading-relaxed
                  "
                >
                  Control-area breakdown for{" "}
                  {selectedDay.date}
                  {" · "}NCA / ISO / NIST alignment
                </p>

              </div>


              {dayBreakdown.length === 0 ? (

                <div
                  className="
                    py-12

                    text-center

                    text-sm
                    text-gray-600
                  "
                >
                  No breakdown data available.
                </div>

              ) : (

                <div
                  className="
                    space-y-5
                    sm:space-y-6
                  "
                >

                  {dayBreakdown.map(
                    (item, index) => {

                      const score = Math.min(
                        Math.max(
                          Number(
                            item.score
                          ) || 0,
                          0
                        ),
                        100
                      );

                      return (
                        <div
                          key={
                            `${item.name}-${index}`
                          }
                          className="min-w-0"
                        >

                          <div
                            className="
                              flex
                              items-start
                              justify-between

                              gap-3

                              mb-2
                            "
                          >

                            <span
                              className="
                                text-sm
                                text-gray-300

                                break-words

                                min-w-0
                              "
                            >
                              {item.name}
                            </span>

                            <span
                              className="
                                text-sm
                                font-semibold
                                text-gray-300

                                whitespace-nowrap
                              "
                            >
                              {score} / 100
                            </span>

                          </div>


                          <div
                            className="
                              w-full
                              h-2

                              bg-[#172130]

                              rounded-full

                              overflow-hidden
                            "
                          >

                            <div
                              className={`
                                h-full

                                rounded-full

                                transition-all
                                duration-500

                                ${
                                  score >= 70
                                    ? "bg-gradient-to-r from-emerald-500 to-green-400"
                                    : score >= 40
                                    ? "bg-gradient-to-r from-yellow-500 to-amber-400"
                                    : "bg-gradient-to-r from-red-600 to-red-400"
                                }
                              `}
                              style={{
                                width: `${score}%`,
                              }}
                            />

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </section>

          </div>


          {/* =================================================
              DAILY HISTORY
          ================================================= */}

          <section
            className="
              bg-[#0c1220]

              border
              border-white/10

              rounded-2xl

              p-4
              sm:p-5
              md:p-6

              mb-6

              min-w-0
            "
          >

            <div
              className="
                flex
                items-start
                justify-between

                gap-4

                mb-5
              "
            >

              <div className="min-w-0">

                <h2
                  className="
                    text-base
                    sm:text-lg

                    font-semibold
                  "
                >
                  Daily Security Score History
                </h2>

                <p
                  className="
                    text-xs
                    text-gray-500

                    mt-1

                    leading-relaxed
                  "
                >
                  Track the organization's security posture trend over time.
                </p>

              </div>


              <CalendarDays
                size={18}
                className="
                  text-emerald-400
                  shrink-0
                "
              />

            </div>


            {dailyScores.length === 0 ? (

              <div
                className="
                  py-10

                  text-center

                  text-sm
                  text-gray-600
                "
              >
                No daily CRSI history available.
              </div>

            ) : (

              <>
                {/* DESKTOP / TABLET */}

                <div
                  className="
                    hidden
                    sm:grid

                    grid-cols-2
                    md:grid-cols-3
                    lg:grid-cols-5

                    gap-3
                  "
                >

                  {dailyScores.map(
                    (day) => (
                      <HistoryCard
                        key={day.date}
                        day={day}
                        selected={
                          selectedDay.date ===
                          day.date
                        }
                        onClick={() =>
                          setSelectedDay(
                            day
                          )
                        }
                      />
                    )
                  )}

                </div>


                {/* MOBILE */}

                <div
                  className="
                    flex
                    sm:hidden

                    overflow-x-auto

                    gap-3

                    pb-2

                    snap-x

                    snap-mandatory

                    scrollbar-thin
                  "
                >

                  {dailyScores.map(
                    (day) => (
                      <button
                        key={day.date}
                        onClick={() =>
                          setSelectedDay(
                            day
                          )
                        }
                        className={`
                          text-left

                          p-4

                          rounded-xl

                          border

                          transition

                          shrink-0

                          w-[180px]

                          snap-start

                          ${
                            selectedDay.date ===
                            day.date
                              ? "border-emerald-500/40 bg-emerald-500/10"
                              : "border-white/5 bg-[#070b16]"
                          }
                        `}
                      >

                        <p
                          className="
                            text-[11px]
                            text-gray-500

                            mb-3

                            break-words
                          "
                        >
                          {day.date}
                        </p>

                        <p
                          className="
                            text-2xl
                            font-bold
                          "
                        >
                          {day.score}

                          <span
                            className="
                              text-xs
                              text-gray-600
                            "
                          >
                            {" "}/ 100
                          </span>
                        </p>

                        <p
                          className={`
                            text-xs

                            mt-2

                            ${
                              day.score >= 70
                                ? "text-emerald-400"
                                : day.score >= 40
                                ? "text-yellow-400"
                                : "text-red-400"
                            }
                          `}
                        >
                          {day.status}
                        </p>

                      </button>
                    )
                  )}

                </div>
              </>
            )}

          </section>


          {/* =================================================
              RECOMMENDATIONS
          ================================================= */}

          <section
            className="
              bg-gradient-to-r
              from-emerald-500/10
              to-green-500/5

              border
              border-emerald-500/20

              rounded-2xl

              p-4
              sm:p-5
              md:p-6
            "
          >

            <div
              className="
                flex

                flex-col
                sm:flex-row

                sm:items-center
                sm:justify-between

                gap-5
              "
            >

              <div
                className="
                  flex
                  items-start

                  gap-3
                  sm:gap-4

                  min-w-0
                "
              >

                <div
                  className="
                    w-11
                    h-11

                    rounded-xl

                    bg-emerald-500/10

                    border
                    border-emerald-500/20

                    flex
                    items-center
                    justify-center

                    shrink-0
                  "
                >
                  <Lightbulb
                    size={21}
                    className="
                      text-emerald-400
                    "
                  />
                </div>


                <div className="min-w-0">

                  <h3
                    className="
                      font-semibold
                      text-white
                    "
                  >
                    CRSI Recommendations
                  </h3>

                  <p
                    className="
                      text-xs
                      text-gray-500

                      mt-1

                      max-w-2xl

                      leading-relaxed
                    "
                  >
                    View recommendations generated dynamically from the security score breakdown and automated CRSI response playbooks.
                  </p>

                </div>

              </div>


              <button
                onClick={() =>
                  navigate(
                    "/crsi-recommendations"
                  )
                }
                className="
                  w-full
                  sm:w-auto

                  flex
                  items-center
                  justify-center

                  gap-2

                  bg-gradient-to-r
                  from-emerald-400
                  to-green-600

                  text-[#04140b]

                  font-bold
                  text-sm

                  px-5
                  py-3

                  rounded-lg

                  hover:opacity-90

                  transition

                  shrink-0
                "
              >
                View Recommendations

                <ChevronRight
                  size={17}
                />
              </button>

            </div>

          </section>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            className="
              flex
              items-start

              gap-2

              mt-6

              text-xs
              text-gray-500

              leading-relaxed
            "
          >

            <CalendarDays
              size={15}
              className="
                shrink-0
                mt-0.5
              "
            />

            <span>
              Daily CRSI evaluated for{" "}
              {selectedDay.date}
              {" — "}
              the organization-wide cumulative score is shown on the CRSI Recommendations page
            </span>

          </div>

        </div>

      </main>

    </PageShell>
  );
}


/* =========================================================
   PAGE SHELL
========================================================= */

function PageShell({
  children,
}) {
  return (
    <div
      className="
        min-h-screen

        bg-[#070b16]

        text-[#eef5f1]

        flex
        flex-col
        lg:flex-row

        overflow-x-hidden
      "
    >
      <Sidebar />

      {children}
    </div>
  );
}


/* =========================================================
   HISTORY CARD
========================================================= */

function HistoryCard({
  day,
  selected,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        text-left

        p-4

        rounded-xl

        border

        transition

        min-w-0

        ${
          selected
            ? "border-emerald-500/40 bg-emerald-500/10"
            : "border-white/5 bg-[#070b16] hover:border-emerald-500/20"
        }
      `}
    >

      <p
        className="
          text-[11px]
          text-gray-500

          mb-3

          break-words
        "
      >
        {day.date}
      </p>


      <p
        className="
          text-2xl
          font-bold
        "
      >
        {day.score}

        <span
          className="
            text-xs
            text-gray-600
          "
        >
          {" "}/ 100
        </span>
      </p>


      <p
        className={`
          text-xs

          mt-2

          ${
            day.score >= 70
              ? "text-emerald-400"
              : day.score >= 40
              ? "text-yellow-400"
              : "text-red-400"
          }
        `}
      >
        {day.status}
      </p>

    </button>
  );
}


/* =========================================================
   SCORE CIRCLE
========================================================= */

function ScoreCircle({
  score,
}) {
  const radius = 78;

  const circumference =
    2 *
    Math.PI *
    radius;

  const safeScore =
    Math.min(
      Math.max(
        Number(score) || 0,
        0
      ),
      100
    );

  const progress =
    (safeScore / 100) *
    circumference;


  return (
    <div
      className="
        relative

        w-36
        h-36

        min-[360px]:w-40
        min-[360px]:h-40

        sm:w-52
        sm:h-52

        shrink-0
      "
    >

      <svg
        viewBox="0 0 200 200"
        className="
          w-full
          h-full

          -rotate-90
        "
      >

        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#172130"
          strokeWidth="13"
        />


        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={
            safeScore >= 70
              ? "#22c55e"
              : safeScore >= 40
              ? "#eab308"
              : "#ef4444"
          }
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={
            circumference
          }
          strokeDashoffset={
            circumference -
            progress
          }
        />

      </svg>


      <div
        className="
          absolute
          inset-0

          flex
          items-center
          justify-center
        "
      >

        <div
          className="
            text-center
          "
        >

          <span
            className="
              text-3xl
              min-[360px]:text-4xl
              sm:text-5xl

              font-bold
            "
          >
            {safeScore}
          </span>

          <span
            className="
              text-sm
              sm:text-lg

              text-gray-500

              ml-1
            "
          >
            /100
          </span>

        </div>

      </div>

    </div>
  );
}