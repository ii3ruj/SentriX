import { useNavigate, useParams } from "react-router-dom";

import {
  BookOpen,
  ArrowLeft,
  FileText,
  Download,
} from "lucide-react";

import Sidebar from "../components/Sidebar";


export default function Recommendations() {

  const navigate = useNavigate();

  const { id } = useParams();


  /*
  |--------------------------------------------------------------------------
  | Temporary Incident Data
  |--------------------------------------------------------------------------
  | مؤقت للـFrontend إلى أن يتم ربط الصفحة بالـBackend.
  |--------------------------------------------------------------------------
  */

  const incident = {

    id:
      id || "INC-0020",

    title:
      "Ransomware detected on Server-01",

    severity:
      "Medium",

    riskScore:
      52,

    playbook:
      "RANSOMWARE_RESPONSE_PLAYBOOK",

  };


  /*
  |--------------------------------------------------------------------------
  | Recommended Actions
  |--------------------------------------------------------------------------
  */

  const recommendations = [

    {
      id: 1,

      title:
        "Isolate affected host",

      description:
        "Disconnect the affected host from the network to prevent further spread.",

      priority:
        "High",

      status:
        "Completed",
    },


    {
      id: 2,

      title:
        "Block malicious IP",

      description:
        "Add identified malicious IP addresses to the firewall blocklist.",

      priority:
        "High",

      status:
        "Completed",
    },


    {
      id: 3,

      title:
        "Terminate malicious processes",

      description:
        "Stop suspicious processes related to the detected ransomware activity.",

      priority:
        "Medium",

      status:
        "Completed",
    },


    {
      id: 4,

      title:
        "Collect and preserve logs",

      description:
        "Collect endpoint, network, authentication, and security logs for investigation.",

      priority:
        "Medium",

      status:
        "Pending",
    },


    {
      id: 5,

      title:
        "Identify affected files",

      description:
        "Identify encrypted, modified, or otherwise affected files and directories.",

      priority:
        "Medium",

      status:
        "Pending",
    },


    {
      id: 6,

      title:
        "Reset compromised credentials",

      description:
        "Reset credentials associated with potentially compromised accounts.",

      priority:
        "High",

      status:
        "Pending",
    },


    {
      id: 7,

      title:
        "Scan connected systems",

      description:
        "Perform security scans across connected systems to identify additional compromise.",

      priority:
        "Medium",

      status:
        "Pending",
    },


    {
      id: 8,

      title:
        "Restore affected services",

      description:
        "Restore affected systems and services after confirming the environment is clean.",

      priority:
        "Low",

      status:
        "Pending",
    },

  ];


  /*
  |--------------------------------------------------------------------------
  | Priority Styles
  |--------------------------------------------------------------------------
  */

  const getPriorityStyle = (
    priority
  ) => {

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
  | Status Styles
  |--------------------------------------------------------------------------
  */

  const getStatusStyle = (
    status
  ) => {

    if (status === "Completed") {

      return "bg-blue-500/10 text-blue-400 border border-blue-500/20";

    }


    return "bg-gray-500/10 text-gray-400 border border-gray-500/20";

  };


  return (

    <div className="min-h-screen bg-[#070b16] text-[#eef5f1] flex">


      {/* =========================================================
          UNIFIED SIDEBAR
      ========================================================= */}

      <Sidebar />


      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}

      <main className="flex-1 min-w-0">


        {/* =======================================================
            HEADER
        ======================================================= */}

        <header className="px-8 py-7 border-b border-white/10">

          <div className="flex items-center gap-3 mb-2">


            <button
              onClick={() =>
                navigate(
                  `/ai-analysis/${incident.id}`
                )
              }
              className="text-gray-500 hover:text-emerald-400 transition"
            >

              <ArrowLeft
                size={18}
              />

            </button>


            <span className="text-sm text-gray-500">
              AI Analysis
            </span>


            <span className="text-gray-700">
              /
            </span>


            <span className="text-sm text-emerald-400">
              Recommendations
            </span>


          </div>


          <h1 className="text-3xl font-bold">
            Recommendations
          </h1>


          <p className="text-sm text-gray-500 mt-1">
            AI-driven response recommendations for the selected incident
          </p>

        </header>


        {/* =======================================================
            CONTENT
        ======================================================= */}

        <div className="p-8 max-w-[1250px] mx-auto">


          {/* =====================================================
              INCIDENT SUMMARY
          ===================================================== */}

          <section className="bg-[#0c1220] border border-white/10 rounded-2xl px-6 py-5 mb-5">

            <div className="grid grid-cols-4 gap-6">


              {/* Incident ID */}

              <div>

                <p className="text-xs text-gray-500 mb-2">
                  Incident ID
                </p>

                <p className="font-bold text-white">
                  {incident.id}
                </p>

              </div>


              {/* Title */}

              <div>

                <p className="text-xs text-gray-500 mb-2">
                  Title
                </p>

                <p className="font-semibold text-gray-200">
                  {incident.title}
                </p>

              </div>


              {/* Severity */}

              <div>

                <p className="text-xs text-gray-500 mb-2">
                  Severity
                </p>

                <span className="inline-flex px-3 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold">

                  {incident.severity}

                </span>

              </div>


              {/* Risk Score */}

              <div>

                <p className="text-xs text-gray-500 mb-2">
                  Risk Score
                </p>

                <p className="text-lg font-bold text-yellow-400">

                  {incident.riskScore}

                  <span className="text-sm text-gray-500">
                    {" "}
                    / 100
                  </span>

                </p>

              </div>


            </div>

          </section>


          {/* =====================================================
              MAIN TWO COLUMN LAYOUT
          ===================================================== */}

          <div className="grid lg:grid-cols-[1fr_280px] gap-5">


            {/* ===================================================
                LEFT COLUMN
            =================================================== */}

            <div className="space-y-5">


              {/* =================================================
                  RECOMMENDED PLAYBOOK
              ================================================= */}

              <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-5">

                <div className="flex items-start gap-4">


                  <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">

                    <BookOpen
                      size={21}
                      className="text-purple-400"
                    />

                  </div>


                  <div>

                    <p className="text-xs text-gray-500 mb-1">
                      Recommended Playbook
                    </p>


                    <h2 className="text-purple-400 font-bold text-base">
                      {incident.playbook}
                    </h2>


                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">

                      This playbook is recommended based on AI analysis,
                      risk score, and organizational context.

                    </p>

                  </div>


                </div>


                {/* Actions Heading */}

                <div className="flex items-center justify-between mt-7 mb-4">

                  <h3 className="font-semibold">

                    Recommended Actions

                    <span className="text-gray-500 ml-1">
                      ({recommendations.length})
                    </span>

                  </h3>

                </div>


                {/* Actions */}

                <div className="space-y-3">

                  {recommendations.map(
                    (recommendation) => (

                      <div
                        key={
                          recommendation.id
                        }
                        className="bg-[#070b16] border border-white/5 rounded-xl px-4 py-4 hover:border-emerald-500/20 transition"
                      >

                        <div className="flex items-center gap-4">


                          {/* Number */}

                          <div className="w-6 text-xs text-gray-500 font-semibold shrink-0">

                            {recommendation.id}.

                          </div>


                          {/* Action */}

                          <div className="flex-1 min-w-0">

                            <p className="text-sm font-semibold text-gray-200">

                              {recommendation.title}

                            </p>


                            <p className="text-xs text-gray-600 mt-1">

                              {recommendation.description}

                            </p>

                          </div>


                          {/* Priority */}

                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-full font-semibold shrink-0 ${getPriorityStyle(
                              recommendation.priority
                            )}`}
                          >

                            {
                              recommendation.priority
                            }

                          </span>


                          {/* Status */}

                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-full font-semibold shrink-0 ${getStatusStyle(
                              recommendation.status
                            )}`}
                          >

                            {
                              recommendation.status
                            }

                          </span>


                        </div>

                      </div>

                    )
                  )}

                </div>


              </section>


            </div>


            {/* ===================================================
                RIGHT COLUMN
            =================================================== */}

            <div className="space-y-5">


              {/* =================================================
                  REPORT
              ================================================= */}

              <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-5">


                <div className="flex items-center gap-2 mb-3">

                  <FileText
                    size={16}
                    className="text-emerald-400"
                  />

                  <h3 className="font-semibold">
                    Report
                  </h3>

                </div>


                <p className="text-xs text-gray-500 leading-relaxed mb-5">

                  Generate a comprehensive report including analysis
                  results, risk assessment, and recommendations.

                </p>


                {/* Generate Report → Archive */}

                <button
                  onClick={() =>
                    navigate(
                      "/archive"
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-green-600 text-[#04140b] font-bold text-sm py-3 rounded-lg hover:opacity-90 transition"
                >

                  <Download
                    size={16}
                  />

                  Generate Report

                </button>


              </section>


            </div>


          </div>


        </div>


      </main>


    </div>

  );

}
