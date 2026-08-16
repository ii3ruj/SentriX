import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  Gauge,
  FileText,
} from "lucide-react";

import Sidebar from "../components/Sidebar";


export default function CRSIRecommendations() {

  const navigate = useNavigate();


  /*
  |--------------------------------------------------------------------------
  | TEMPORARY DATA
  |--------------------------------------------------------------------------
  | لاحقًا هذه البيانات ستأتي من Backend / AI.
  |
  | Security Score
  |       ↓
  | Score Breakdown
  |       ↓
  | أضعف/أهم Breakdown
  |       ↓
  | Playbook
  |       ↓
  | Recommendations
  |--------------------------------------------------------------------------
  */

  const securityScore = 68;


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
  | RECOMMENDED PLAYBOOK
  |--------------------------------------------------------------------------
  */

  const recommendedPlaybook =
    "ENDPOINT_SECURITY_PLAYBOOK";


  /*
  |--------------------------------------------------------------------------
  | CRSI RECOMMENDATIONS
  |--------------------------------------------------------------------------
  */

  const recommendations = [

    {
      id: 1,

      title:
        "Review endpoint protection coverage",

      description:
        "Review endpoint security coverage and identify systems that are not adequately protected.",

      priority: "High",

      status: "Pending",
    },


    {
      id: 2,

      title:
        "Investigate unresolved endpoint alerts",

      description:
        "Review unresolved endpoint security alerts and determine whether additional investigation is required.",

      priority: "High",

      status: "Pending",
    },


    {
      id: 3,

      title:
        "Update endpoint security controls",

      description:
        "Review and strengthen endpoint security controls across organizational assets.",

      priority: "Medium",

      status: "Pending",
    },


    {
      id: 4,

      title:
        "Review endpoint configuration",

      description:
        "Assess endpoint configurations and identify security weaknesses that may reduce the organization's security posture.",

      priority: "Medium",

      status: "Pending",
    },


    {
      id: 5,

      title:
        "Verify security monitoring coverage",

      description:
        "Verify that critical endpoints are properly monitored and security events are being collected.",

      priority: "Medium",

      status: "Pending",
    },

  ];


  /*
  |--------------------------------------------------------------------------
  | PRIORITY STYLE
  |--------------------------------------------------------------------------
  */

  const getPriorityStyle = (priority) => {

    if (priority === "High") {

      return "bg-red-500/10 text-red-400 border border-red-500/20";

    }


    if (priority === "Medium") {

      return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";

    }


    return "bg-blue-500/10 text-blue-400 border border-blue-500/20";

  };


  /*
  |--------------------------------------------------------------------------
  | STATUS STYLE
  |--------------------------------------------------------------------------
  */

  const getStatusStyle = (status) => {

    if (status === "Completed") {

      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";

    }


    return "bg-gray-500/10 text-gray-400 border border-gray-500/20";

  };


  /*
  |--------------------------------------------------------------------------
  | GENERATE REPORT
  |--------------------------------------------------------------------------
  */

  const handleGenerateReport = () => {

    /*
      لاحقًا هنا ممكن نحفظ التقرير في Backend / Database.

      حاليًا ننتقل إلى Archive.
    */

    navigate("/archive");

  };


  return (

    <div className="min-h-screen bg-[#070b16] text-[#eef5f1] flex">


      {/* =========================================================
          UNIFIED SIDEBAR
      ========================================================= */}

      <Sidebar />


      {/* =========================================================
          MAIN
      ========================================================= */}

      <main className="flex-1 min-w-0">


        {/* =======================================================
            HEADER
        ======================================================= */}

        <header className="px-8 py-7 border-b border-white/10">

          <div className="flex items-center gap-3 mb-2">

            <button
              onClick={() =>
                navigate("/crsi-assessment")
              }
              className="text-gray-500 hover:text-emerald-400 transition"
            >

              <ArrowLeft size={18} />

            </button>


            <span className="text-sm text-emerald-400">
              CRSI
            </span>

          </div>


          <h1 className="text-3xl font-bold">
            Security Recommendations
          </h1>


          <p className="text-sm text-gray-500 mt-1">

            Recommendations generated from the
            organization's security score and
            score breakdown.

          </p>

        </header>


        {/* =======================================================
            CONTENT
        ======================================================= */}

        <div className="p-8 max-w-[1250px] mx-auto">


          {/* =====================================================
              SECURITY SCORE
          ===================================================== */}

          <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-6 mb-5">

            <div className="grid md:grid-cols-3 gap-6">


              <div>

                <p className="text-xs text-gray-500 mb-2">
                  Security Score
                </p>


                <p className="text-3xl font-bold text-emerald-400">

                  {securityScore}

                  <span className="text-sm text-gray-500">
                    {" "}
                    / 100
                  </span>

                </p>

              </div>


              <div>

                <p className="text-xs text-gray-500 mb-2">
                  Security Posture
                </p>


                <p className="text-lg font-semibold text-emerald-400">
                  Good
                </p>

              </div>


              <div>

                <p className="text-xs text-gray-500 mb-2">
                  Recommendation Source
                </p>


                <p className="text-sm text-gray-300">
                  CRSI Security Score
                </p>

              </div>


            </div>

          </section>


          {/* =====================================================
              TWO COLUMNS
          ===================================================== */}

          <div className="grid lg:grid-cols-[1fr_300px] gap-5">


            {/* ===================================================
                LEFT
            =================================================== */}

            <div className="space-y-5">


              {/* =================================================
                  PLAYBOOK
              ================================================= */}

              <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-6">

                <div className="flex items-start gap-4">


                  <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">

                    <BookOpen
                      size={21}
                      className="text-purple-400"
                    />

                  </div>


                  <div>

                    <p className="text-xs text-gray-500 mb-1">
                      Recommended Playbook
                    </p>


                    <h2 className="text-purple-400 font-bold">
                      {recommendedPlaybook}
                    </h2>


                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">

                      This playbook is selected based
                      on the current security score
                      breakdown.

                    </p>

                  </div>


                </div>

              </section>


              {/* =================================================
                  ACTIONS
              ================================================= */}

              <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-6">


                <div className="flex items-center justify-between mb-5">


                  <div>

                    <h2 className="text-lg font-semibold">
                      Recommended Actions
                    </h2>


                    <p className="text-xs text-gray-500 mt-1">

                      Actions recommended to improve
                      the organization's security posture.

                    </p>

                  </div>


                  <span className="text-xs text-gray-500">

                    {recommendations.length} actions

                  </span>


                </div>


                <div className="space-y-3">


                  {recommendations.map(
                    (item) => (

                      <div
                        key={item.id}
                        className="bg-[#070b16] border border-white/5 rounded-xl p-4 hover:border-emerald-500/20 transition"
                      >


                        <div className="flex items-center gap-4">


                          <div className="w-6 text-xs text-gray-500">
                            {item.id}.
                          </div>


                          <div className="flex-1">

                            <p className="text-sm font-semibold text-gray-200">
                              {item.title}
                            </p>


                            <p className="text-xs text-gray-600 mt-1">
                              {item.description}
                            </p>

                          </div>


                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${getPriorityStyle(
                              item.priority
                            )}`}
                          >

                            {item.priority}

                          </span>


                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${getStatusStyle(
                              item.status
                            )}`}
                          >

                            {item.status}

                          </span>


                        </div>


                      </div>

                    )
                  )}


                </div>


              </section>


              {/* =================================================
                  GENERATE REPORT
              ================================================= */}

              <section className="bg-[#0c1220] border border-emerald-500/20 rounded-2xl p-6">

                <div className="flex items-center justify-between gap-6">


                  <div className="flex items-center gap-4">


                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">

                      <FileText
                        size={21}
                        className="text-emerald-400"
                      />

                    </div>


                    <div>

                      <h2 className="text-sm font-semibold text-gray-200">
                        Generate Report
                      </h2>


                      <p className="text-xs text-gray-500 mt-1">

                        Generate and archive this CRSI
                        security recommendations report.

                      </p>

                    </div>


                  </div>


                  <button
                    onClick={handleGenerateReport}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-green-600 text-[#04140b] font-bold text-sm px-5 py-3 rounded-lg hover:opacity-90 transition shrink-0"
                  >

                    <FileText
                      size={17}
                    />

                    Generate Report

                  </button>


                </div>

              </section>


            </div>


            {/* ===================================================
                RIGHT
            =================================================== */}

            <div className="space-y-5">


              {/* =================================================
                  BREAKDOWN
              ================================================= */}

              <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-5">


                <div className="flex items-center gap-2 mb-5">

                  <Gauge
                    size={17}
                    className="text-emerald-400"
                  />

                  <h3 className="font-semibold">
                    Score Breakdown
                  </h3>

                </div>


                <div className="space-y-5">


                  {breakdown.map(
                    (item) => (

                      <div key={item.name}>


                        <div className="flex items-center justify-between mb-2">

                          <span className="text-xs text-gray-400">
                            {item.name}
                          </span>


                          <span className="text-xs font-semibold">
                            {item.score}
                          </span>

                        </div>


                        <div className="h-1.5 bg-[#172130] rounded-full overflow-hidden">

                          <div
                            className="h-full bg-emerald-500 rounded-full"
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


              {/* =================================================
                  STATUS
              ================================================= */}

              <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-5">


                <div className="flex items-center gap-2 mb-3">

                  <Clock3
                    size={16}
                    className="text-emerald-400"
                  />

                  <h3 className="font-semibold">
                    Recommendation Status
                  </h3>

                </div>


                <div className="flex items-center gap-2 text-xs text-gray-500">

                  <CheckCircle2
                    size={15}
                    className="text-emerald-400"
                  />

                  Recommendations generated

                </div>


              </section>


            </div>


          </div>


        </div>


      </main>


    </div>

  );
}