import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Gauge,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";

import Sidebar from "../components/Sidebar";


export default function CRSIAssessment() {

  const navigate = useNavigate();


  /*
  |--------------------------------------------------------------------------
  | Temporary Daily CRSI Data
  |--------------------------------------------------------------------------
  */

  const dailyScores = [

    {
      date: "Aug 15, 2026",
      score: 68,
      status: "Good",
    },

    {
      date: "Aug 14, 2026",
      score: 71,
      status: "Good",
    },

    {
      date: "Aug 13, 2026",
      score: 74,
      status: "Good",
    },

    {
      date: "Aug 12, 2026",
      score: 69,
      status: "Good",
    },

    {
      date: "Aug 11, 2026",
      score: 76,
      status: "Good",
    },

  ];


  const [
    selectedDay,
    setSelectedDay,
  ] = useState(
    dailyScores[0]
  );


  /*
  |--------------------------------------------------------------------------
  | Security Score Breakdown
  |--------------------------------------------------------------------------
  */

  const breakdown = [

    {
      name: "Identify & Access",
      score: 68,
    },

    {
      name: "Network Security",
      score: 72,
    },

    {
      name: "Endpoint Security",
      score: 64,
    },

    {
      name: "Detect & Respond",
      score: 68,
    },

    {
      name: "Backup & Recovery",
      score: 60,
    },

    {
      name: "NCA Controls",
      score: 70,
    },

  ];


  /*
  |--------------------------------------------------------------------------
  | Score Status
  |--------------------------------------------------------------------------
  */

  const getScoreStatus = (
    score
  ) => {

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

      className:
        "text-red-400",

    };

  };


  const scoreStatus =
    getScoreStatus(
      selectedDay.score
    );


  const previousDay =
    dailyScores[1];


  const scoreDifference =
    selectedDay.score -
    previousDay.score;


  return (

    <div className="min-h-screen bg-[#070b16] text-[#eef5f1] flex">


      {/* =====================================================
          UNIFIED SIDEBAR
      ===================================================== */}

      <Sidebar />


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="flex-1 min-w-0">


        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="px-8 py-7 border-b border-white/10">

          <div className="flex items-center gap-2 mb-2">

            <Gauge
              size={20}
              className="text-emerald-400"
            />

            <span className="text-sm text-emerald-400 font-medium">
              CRSI Assessment
            </span>

          </div>


          <h1 className="text-3xl font-bold">
            CRSI Assessment
          </h1>


          <p className="text-sm text-gray-500 mt-1">

            Daily assessment of the organization's
            overall security score.

          </p>

        </header>


        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className="p-8 max-w-[1250px] mx-auto">


          {/* =================================================
              DATE
          ================================================= */}

          <div className="flex items-center justify-between mb-6">


            <div>

              <p className="text-xs text-gray-500 mb-1">
                Security score for
              </p>


              <div className="flex items-center gap-2">

                <CalendarDays
                  size={17}
                  className="text-emerald-400"
                />

                <span className="font-semibold">

                  {selectedDay.date}

                </span>

              </div>

            </div>


            <select
              value={selectedDay.date}
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
              className="bg-[#0c1220] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-300 outline-none"
            >

              {dailyScores.map(
                (day) => (

                  <option
                    key={day.date}
                    value={day.date}
                    className="bg-[#0c1220]"
                  >

                    {day.date}

                  </option>

                )
              )}

            </select>

          </div>


          {/* =================================================
              TOP CARDS
          ================================================= */}

          <div className="grid lg:grid-cols-2 gap-5 mb-6">


            {/* =================================================
                OVERALL SCORE
            ================================================= */}

            <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-7">

              <div className="flex items-center justify-between mb-7">

                <div>

                  <h2 className="text-xl font-semibold">
                    Overall Security Score
                  </h2>

                  <p className="text-xs text-gray-500 mt-1">
                    Organization-wide security score
                  </p>

                </div>


                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">

                  <ShieldCheck
                    size={20}
                    className="text-emerald-400"
                  />

                </div>

              </div>


              {/* SCORE CIRCLE */}

              <div className="flex justify-center py-5">

                <ScoreCircle
                  score={
                    selectedDay.score
                  }
                />

              </div>


              <div className="text-center">

                <p
                  className={`text-xl font-semibold ${scoreStatus.className}`}
                >

                  {scoreStatus.label}

                </p>

                <p className="text-xs text-gray-500 mt-2">
                  Current security score
                </p>

              </div>


              {/* Difference */}

              <div className="flex justify-center mt-6">

                <div
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                    scoreDifference >= 0
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
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


                  {Math.abs(
                    scoreDifference
                  )}{" "}

                  points compared
                  with previous day

                </div>

              </div>

            </section>


            {/* =================================================
                BREAKDOWN
            ================================================= */}

            <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-7">

              <div className="mb-8">

                <h2 className="text-xl font-semibold">
                  Score Breakdown
                </h2>

                <p className="text-xs text-gray-500 mt-1">

                  Security score by control area

                </p>

              </div>


              <div className="space-y-6">

                {breakdown.map(
                  (item) => (

                    <div
                      key={item.name}
                    >

                      <div className="flex items-center justify-between mb-2">

                        <span className="text-sm text-gray-300">
                          {item.name}
                        </span>


                        <span className="text-sm font-semibold text-gray-300">

                          {item.score}
                          {" "}
                          / 100

                        </span>

                      </div>


                      <div className="w-full h-2 bg-[#172130] rounded-full overflow-hidden">

                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                          style={{
                            width:
                              `${item.score}%`,
                          }}
                        />

                      </div>

                    </div>

                  )
                )}

              </div>

            </section>


          </div>


          {/* =================================================
              DAILY SCORES
          ================================================= */}

          <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-6 mb-6">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-lg font-semibold">
                  Daily Security Score
                </h2>

                <p className="text-xs text-gray-500 mt-1">

                  Track the organization's security
                  score over time.

                </p>

              </div>


              <CalendarDays
                size={18}
                className="text-emerald-400"
              />

            </div>


            <div className="grid grid-cols-5 gap-3">

              {dailyScores.map(
                (day) => (

                  <button
                    key={day.date}
                    onClick={() =>
                      setSelectedDay(
                        day
                      )
                    }
                    className={`text-left p-4 rounded-xl border transition ${
                      selectedDay.date ===
                      day.date

                        ? "border-emerald-500/40 bg-emerald-500/10"

                        : "border-white/5 bg-[#070b16] hover:border-emerald-500/20"
                    }`}
                  >

                    <p className="text-[11px] text-gray-500 mb-3">
                      {day.date}
                    </p>


                    <p className="text-2xl font-bold">

                      {day.score}

                      <span className="text-xs text-gray-600">
                        {" "}
                        / 100
                      </span>

                    </p>


                    <p className="text-xs text-emerald-400 mt-2">
                      {day.status}
                    </p>

                  </button>

                )
              )}

            </div>

          </section>


          {/* =================================================
              RECOMMENDATIONS
          ================================================= */}

          <section className="bg-gradient-to-r from-emerald-500/10 to-green-500/5 border border-emerald-500/20 rounded-2xl p-6">

            <div className="flex items-center justify-between gap-6">


              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">

                  <Lightbulb
                    size={21}
                    className="text-emerald-400"
                  />

                </div>


                <div>

                  <h3 className="font-semibold text-white">
                    CRSI Recommendations
                  </h3>


                  <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">

                    View recommendations generated
                    from the security score breakdown
                    and CRSI playbooks.

                  </p>

                </div>

              </div>


              <button
                onClick={() =>
                  navigate(
                    "/crsi-recommendations"
                  )
                }
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-green-600 text-[#04140b] font-bold text-sm px-5 py-3 rounded-lg hover:opacity-90 transition shrink-0"
              >

                View Recommendations

                <ChevronRight
                  size={17}
                />

              </button>

            </div>

          </section>


          {/* =================================================
              GENERATED DATE
          ================================================= */}

          <div className="flex items-center gap-2 mt-6 text-xs text-gray-500">

            <CalendarDays
              size={15}
            />

            CRSI score generated on{" "}

            {selectedDay.date}

          </div>


        </div>


      </main>


    </div>

  );

}


/*
|--------------------------------------------------------------------------
| Score Circle
|--------------------------------------------------------------------------
*/

function ScoreCircle({
  score,
}) {

  const radius = 78;

  const circumference =
    2 *
    Math.PI *
    radius;

  const progress =
    (score / 100) *
    circumference;


  return (

    <div className="relative w-52 h-52">

      <svg
        viewBox="0 0 200 200"
        className="w-full h-full -rotate-90"
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
          stroke="#22c55e"
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


      <div className="absolute inset-0 flex items-center justify-center">

        <div className="text-center">

          <span className="text-5xl font-bold">
            {score}
          </span>

          <span className="text-lg text-gray-500 ml-1">
            /100
          </span>

        </div>

      </div>

    </div>

  );

}