import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  BookOpen,
  ArrowLeft,
  FileText,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import { apiService } from "../services/api";


/* =========================================================
   RECOMMENDATIONS
   SERVER DATA ONLY
   NO MOCK DATA
   NO LOCALSTORAGE FALLBACK
========================================================= */

export default function Recommendations() {
  const navigate = useNavigate();
  const { id } = useParams();

  /* =======================================================
     SERVER DATA
  ======================================================= */

  const [incident, setIncident] = useState(null);
  const [recommendationsList, setRecommendationsList] =
    useState([]);

  /* =======================================================
     UI STATE
  ======================================================= */

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);


  /* =======================================================
     FETCH REAL SERVER DATA
  ======================================================= */

  useEffect(() => {
    let isMounted = true;

    const fetchRecommendations = async () => {
      try {
        if (isMounted) {
          setError(null);
        }

        /*
         * ---------------------------------------------------
         * Determine incident ID
         * ---------------------------------------------------
         */

        let targetId = id;


        /*
         * ---------------------------------------------------
         * If no ID exists:
         * Ask backend for latest recommendations.
         * ---------------------------------------------------
         */

        if (!targetId) {
          const latest =
            await apiService.getRecommendations();

          targetId =
            latest?.incident_id ||
            latest?.incident?.id ||
            latest?.id ||
            null;

          if (!targetId) {
            if (isMounted) {
              setIncident(null);
              setRecommendationsList([]);
              setError(
                "No incident ID was returned by the server."
              );
            }

            return;
          }
        }


        /*
         * ---------------------------------------------------
         * Get REAL incident from backend
         * ---------------------------------------------------
         */

        const incidentResponse =
          await apiService.getIncidentById(
            targetId
          );

        if (!isMounted) {
          return;
        }

        const realIncident =
          incidentResponse?.incident ||
          incidentResponse;

        if (!realIncident) {
          setIncident(null);
          setRecommendationsList([]);

          setError(
            `Incident ${targetId} was not found on the server.`
          );

          return;
        }

        setIncident(realIncident);


        /*
         * ---------------------------------------------------
         * Get REAL recommendations
         * ---------------------------------------------------
         */

        let serverRecommendations =
          realIncident.recommended_actions;


        /*
         * If incident itself doesn't contain
         * recommendations, call recommendations API.
         */

        if (
          !Array.isArray(
            serverRecommendations
          )
        ) {
          const recommendationsResponse =
            await apiService.getRecommendations(
              targetId
            );

          if (!isMounted) {
            return;
          }

          if (
            Array.isArray(
              recommendationsResponse
            )
          ) {
            serverRecommendations =
              recommendationsResponse;
          } else if (
            Array.isArray(
              recommendationsResponse?.recommendations
            )
          ) {
            serverRecommendations =
              recommendationsResponse.recommendations;
          } else if (
            Array.isArray(
              recommendationsResponse?.actions
            )
          ) {
            serverRecommendations =
              recommendationsResponse.actions;
          } else if (
            Array.isArray(
              recommendationsResponse?.recommended_actions
            )
          ) {
            serverRecommendations =
              recommendationsResponse.recommended_actions;
          } else {
            serverRecommendations = [];
          }
        }


        /*
         * ---------------------------------------------------
         * FORMAT SERVER DATA ONLY
         *
         * No values are invented.
         * ---------------------------------------------------
         */

        const mappedRecommendations =
          Array.isArray(
            serverRecommendations
          )
            ? serverRecommendations.map(
                (action, index) => {
                  /*
                   * Backend may return
                   * a simple string.
                   */

                  if (
                    typeof action ===
                    "string"
                  ) {
                    return {
                      id: index + 1,
                      title: action,
                      description: "",
                      priority: null,
                      status: null,
                    };
                  }


                  /*
                   * Backend may return
                   * an object.
                   */

                  return {
                    id:
                      action?.action_order ??
                      action?.id ??
                      index + 1,

                    title:
                      action?.title ||
                      action?.name ||
                      "Untitled recommendation",

                    description:
                      action?.description ||
                      "",

                    priority:
                      action?.priority ??
                      null,

                    status:
                      action?.status ??
                      null,
                  };
                }
              )
            : [];


        if (!isMounted) {
          return;
        }

        setRecommendationsList(
          mappedRecommendations
        );

      } catch (err) {
        console.error(
          "Recommendations API Error:",
          err
        );

        if (!isMounted) {
          return;
        }

        /*
         * IMPORTANT:
         *
         * NO MOCK
         * NO FALLBACK
         * NO LOCALSTORAGE
         */

        setIncident(null);
        setRecommendationsList([]);

        setError(
          err?.message ||
            "Unable to load recommendations from the server."
        );

      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };


    fetchRecommendations();


    /*
     * Refresh from REAL backend.
     */

    const interval =
      setInterval(
        fetchRecommendations,
        8000
      );


    return () => {
      isMounted = false;
      clearInterval(interval);
    };

  }, [id]);


  /* =======================================================
     PRIORITY STYLE
  ======================================================= */

  const getPriorityStyle = (
    priority
  ) => {
    if (
      priority === "High" ||
      priority === "Critical"
    ) {
      return `
        bg-red-500/10
        text-red-400
        border
        border-red-500/20
      `;
    }

    if (
      priority === "Medium"
    ) {
      return `
        bg-yellow-500/10
        text-yellow-400
        border
        border-yellow-500/20
      `;
    }

    return `
      bg-blue-500/10
      text-blue-400
      border
      border-blue-500/20
    `;
  };


  /* =======================================================
     STATUS STYLE
  ======================================================= */

  const getStatusStyle = (
    status
  ) => {
    if (
      status === "Completed"
    ) {
      return `
        bg-emerald-500/10
        text-emerald-400
        border
        border-emerald-500/20
      `;
    }

    if (
      status === "Pending"
    ) {
      return `
        bg-yellow-500/10
        text-yellow-400
        border
        border-yellow-500/20
      `;
    }

    return `
      bg-gray-500/10
      text-gray-400
      border
      border-gray-500/20
    `;
  };


  /* =======================================================
     GENERATE / VERIFY REPORT
  ======================================================= */

  const handleGenerateReport =
    async () => {

      if (!incident?.id) {
        window.alert(
          "No incident is loaded yet. Please wait for the incident to load from the server."
        );

        return;
      }


      if (isArchiving) {
        return;
      }


      const confirmed =
        window.confirm(
          `Generate and archive the report for ${incident.id}?\n\n` +
          `The report will be stored as an immutable snapshot with a SHA-256 integrity fingerprint and retained for 7 years.`
        );


      if (!confirmed) {
        return;
      }


      setIsArchiving(true);


      try {

        /*
         * ---------------------------------------------------
         * Verify archive using backend
         * ---------------------------------------------------
         */

        const verification =
          await apiService.verifyArchiveHash(
            incident.id
          );


        /*
         * ---------------------------------------------------
         * Open official archived PDF
         * ---------------------------------------------------
         */

        window.open(
          apiService.archiveDownloadUrl(
            incident.id
          ),
          "_blank"
        );


        window.alert(
          `Report archived successfully.\n\n` +

          `Report ID: ${
            incident.id
          }\n` +

          `SHA-256: ${
            String(
              verification?.stored_sha256 ||
                ""
            ).slice(
              0,
              32
            )
          }...\n` +

          `Integrity verified: ${
            verification?.integrity_ok
              ? "PASSED"
              : "FAILED"
          }\n` +

          `Archived by: ${
            verification?.archived_by ||
            "SentriX Engine"
          }\n` +

          `Retention until: ${
            verification?.retention_until ||
            "-"
          }`
        );


        navigate("/archive");

      } catch (err) {
        console.error(
          "Archive error:",
          err
        );

        window.alert(
          `Could not archive the report: ${
            err?.message ||
            "Unknown error"
          }`
        );

      } finally {
        setIsArchiving(false);
      }
    };


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
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
            "
          >

            <Loader2
              size={32}
              className="
                animate-spin
                text-emerald-400
                mx-auto
                mb-3
              "
            />

            <p className="text-sm">
              Loading recommendations...
            </p>

            <p
              className="
                text-xs
                text-gray-600
                mt-2
              "
            >
              Loading incident data from the server
            </p>

          </div>

        </main>

      </div>
    );
  }


  /* =======================================================
     ERROR / NO INCIDENT
  ======================================================= */

  if (!incident) {
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
              max-w-lg

              bg-[#0c1220]

              border
              border-white/10

              rounded-2xl

              p-5
              sm:p-8

              text-center
            "
          >

            <AlertCircle
              size={34}
              className="
                text-red-400
                mx-auto
                mb-4
              "
            />

            <h2
              className="
                text-lg
                font-bold
                mb-2
              "
            >
              Recommendations Unavailable
            </h2>

            <p
              className="
                text-sm
                text-gray-500
                leading-relaxed
                break-words
              "
            >
              {error ||
                "No incident data was returned by the server."}
            </p>

            <button
              onClick={() =>
                navigate("/incidents")
              }
              className="
                inline-flex
                items-center
                justify-center

                gap-2

                mt-6

                bg-emerald-500/10

                border
                border-emerald-500/20

                text-emerald-400

                px-4
                py-2.5

                rounded-lg

                text-sm

                hover:bg-emerald-500/15

                transition
              "
            >

              <ArrowLeft
                size={15}
              />

              Back to Incidents

            </button>

          </div>

        </main>

      </div>
    );
  }


  /* =======================================================
     REAL INCIDENT VALUES
  ======================================================= */

  const incidentId =
    incident.id || id;

  const incidentTitle =
    incident.title ||
    "Security Incident";

  const incidentSeverity =
    incident.severity ||
    "Not provided";

  const riskScore =
    incident.risk_score ??
    incident.riskScore ??
    null;

  const playbook =
    incident.playbook ||
    incident.response_playbook ||
    null;


  /* =======================================================
     MAIN UI
  ======================================================= */

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
              sm:gap-3

              mb-2

              min-w-0
            "
          >

            <button
              onClick={() =>
                navigate(
                  `/ai-analysis/${incidentId}`
                )
              }
              className="
                text-gray-500
                hover:text-emerald-400
                transition
                shrink-0
              "
            >
              <ArrowLeft
                size={18}
              />
            </button>


            <span
              className="
                text-sm
                text-gray-500
                truncate
              "
            >
              AI Analysis
            </span>


            <span
              className="
                text-gray-700
                shrink-0
              "
            >
              /
            </span>


            <span
              className="
                text-sm
                text-emerald-400
                truncate
              "
            >
              Recommendations
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
            Recommendations
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
            AI-driven response recommendations
            and mitigation playbooks for the
            selected incident.
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
              INCIDENT SUMMARY
          ================================================= */}

          <section
            className="
              bg-[#0c1220]

              border
              border-white/10

              rounded-2xl

              px-4
              sm:px-5
              md:px-6

              py-5

              mb-5

              min-w-0
            "
          >

            <div
              className="
                grid

                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-4

                gap-4
                sm:gap-5
                lg:gap-6
              "
            >

              {/* INCIDENT ID */}

              <div className="min-w-0">

                <p
                  className="
                    text-xs
                    text-gray-500

                    mb-2
                  "
                >
                  Incident ID
                </p>

                <p
                  className="
                    font-bold
                    text-white
                    font-mono

                    break-all
                  "
                >
                  {incidentId}
                </p>

              </div>


              {/* TITLE */}

              <div className="min-w-0">

                <p
                  className="
                    text-xs
                    text-gray-500

                    mb-2
                  "
                >
                  Title
                </p>

                <p
                  className="
                    font-semibold
                    text-gray-200

                    break-words

                    leading-relaxed
                  "
                >
                  {incidentTitle}
                </p>

              </div>


              {/* SEVERITY */}

              <div className="min-w-0">

                <p
                  className="
                    text-xs
                    text-gray-500

                    mb-2
                  "
                >
                  Severity
                </p>

                <span
                  className={`
                    inline-flex

                    px-3
                    py-1

                    rounded-md

                    text-xs
                    font-semibold

                    ${
                      incidentSeverity ===
                      "Critical"
                        ? `
                          bg-red-500/10
                          border
                          border-red-500/20
                          text-red-400
                        `
                        : incidentSeverity ===
                          "High"
                        ? `
                          bg-orange-500/10
                          border
                          border-orange-500/20
                          text-orange-400
                        `
                        : incidentSeverity ===
                          "Medium"
                        ? `
                          bg-yellow-500/10
                          border
                          border-yellow-500/20
                          text-yellow-400
                        `
                        : `
                          bg-gray-500/10
                          border
                          border-gray-500/20
                          text-gray-400
                        `
                    }
                  `}
                >
                  {incidentSeverity}
                </span>

              </div>


              {/* RISK */}

              <div className="min-w-0">

                <p
                  className="
                    text-xs
                    text-gray-500

                    mb-2
                  "
                >
                  Risk Score
                </p>


                {riskScore !== null ? (

                  <p
                    className="
                      text-lg
                      font-bold
                      text-yellow-400
                    "
                  >

                    {riskScore}

                    <span
                      className="
                        text-sm
                        text-gray-500
                      "
                    >
                      {" "}/ 100
                    </span>

                  </p>

                ) : (

                  <p
                    className="
                      text-sm
                      text-gray-600
                      italic
                    "
                  >
                    Not provided
                  </p>

                )}

              </div>

            </div>

          </section>


          {/* =================================================
              TWO COLUMN
          ================================================= */}

          <div
            className="
              grid

              grid-cols-1

              lg:grid-cols-[minmax(0,1fr)_280px]

              gap-4
              sm:gap-5

              min-w-0
            "
          >

            {/* =================================================
                LEFT
            ================================================= */}

            <div
              className="
                space-y-5
                min-w-0
              "
            >

              {/* =================================================
                  PLAYBOOK + ACTIONS
              ================================================= */}

              <section
                className="
                  bg-[#0c1220]

                  border
                  border-white/10

                  rounded-2xl

                  p-4
                  sm:p-5

                  min-w-0
                "
              >

                {/* PLAYBOOK */}

                <div
                  className="
                    flex

                    flex-col
                    sm:flex-row

                    items-start

                    gap-4
                  "
                >

                  <div
                    className="
                      w-11
                      h-11

                      rounded-xl

                      bg-purple-500/10

                      border
                      border-purple-500/20

                      flex
                      items-center
                      justify-center

                      shrink-0
                    "
                  >

                    <BookOpen
                      size={21}
                      className="
                        text-purple-400
                      "
                    />

                  </div>


                  <div
                    className="
                      min-w-0
                    "
                  >

                    <p
                      className="
                        text-xs
                        text-gray-500

                        mb-1
                      "
                    >
                      Recommended Playbook
                    </p>


                    <h2
                      className="
                        text-purple-400

                        font-bold

                        text-sm
                        sm:text-base

                        break-words
                      "
                    >
                      {playbook ||
                        "Not provided by server"}
                    </h2>


                    <p
                      className="
                        text-xs
                        text-gray-500

                        mt-2

                        leading-relaxed

                        max-w-3xl
                      "
                    >
                      This response playbook is
                      provided by the backend based
                      on the incident analysis.
                    </p>

                  </div>

                </div>


                {/* ACTIONS HEADING */}

                <div
                  className="
                    flex

                    flex-col
                    sm:flex-row

                    sm:items-center
                    sm:justify-between

                    gap-2

                    mt-7
                    mb-4
                  "
                >

                  <h3
                    className="
                      font-semibold
                    "
                  >
                    Recommended Actions

                    <span
                      className="
                        text-gray-500
                        ml-1
                      "
                    >
                      ({recommendationsList.length})
                    </span>

                  </h3>

                </div>


                {/* ACTIONS */}

                {recommendationsList.length ===
                0 ? (

                  <div
                    className="
                      bg-[#070b16]

                      border
                      border-white/5

                      rounded-xl

                      px-4
                      py-8

                      text-center
                    "
                  >

                    <p
                      className="
                        text-sm
                        text-gray-500
                      "
                    >
                      No recommendations were
                      returned by the server.
                    </p>

                  </div>

                ) : (

                  <div
                    className="
                      space-y-3
                    "
                  >

                    {recommendationsList.map(
                      (
                        recommendation,
                        index
                      ) => (

                        <div
                          key={
                            recommendation.id ??
                            index
                          }
                          className="
                            bg-[#070b16]

                            border
                            border-white/5

                            rounded-xl

                            px-3
                            sm:px-4

                            py-4

                            hover:border-emerald-500/20

                            transition

                            min-w-0
                          "
                        >

                          <div
                            className="
                              flex

                              flex-col
                              sm:flex-row

                              sm:items-center

                              gap-3
                              sm:gap-4
                            "
                          >

                            {/* NUMBER */}

                            <div
                              className="
                                w-6

                                text-xs
                                text-gray-500
                                font-semibold

                                shrink-0
                              "
                            >
                              {index + 1}.
                            </div>


                            {/* TEXT */}

                            <div
                              className="
                                flex-1

                                min-w-0
                              "
                            >

                              <p
                                className="
                                  text-sm
                                  font-semibold
                                  text-gray-200

                                  break-words
                                "
                              >
                                {recommendation.title}
                              </p>


                              {recommendation.description && (
                                <p
                                  className="
                                    text-xs
                                    text-gray-600

                                    mt-1

                                    leading-relaxed

                                    break-words
                                  "
                                >
                                  {
                                    recommendation.description
                                  }
                                </p>
                              )}

                            </div>


                            {/* BADGES */}

                            <div
                              className="
                                flex
                                flex-wrap

                                items-center

                                gap-2

                                sm:shrink-0

                                pl-9
                                sm:pl-0
                              "
                            >

                              {recommendation.priority && (
                                <span
                                  className={`
                                    text-[10px]

                                    px-2.5
                                    py-1

                                    rounded-full

                                    font-semibold

                                    whitespace-nowrap

                                    ${getPriorityStyle(
                                      recommendation.priority
                                    )}
                                  `}
                                >
                                  {
                                    recommendation.priority
                                  }
                                </span>
                              )}


                              {recommendation.status && (
                                <span
                                  className={`
                                    text-[10px]

                                    px-2.5
                                    py-1

                                    rounded-full

                                    font-semibold

                                    whitespace-nowrap

                                    ${getStatusStyle(
                                      recommendation.status
                                    )}
                                  `}
                                >
                                  {
                                    recommendation.status
                                  }
                                </span>
                              )}

                            </div>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </section>

            </div>


            {/* =================================================
                RIGHT
            ================================================= */}

            <div
              className="
                space-y-5
                min-w-0
              "
            >

              <section
                className="
                  bg-[#0c1220]

                  border
                  border-white/10

                  rounded-2xl

                  p-4
                  sm:p-5

                  min-w-0
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2

                    mb-3
                  "
                >

                  <FileText
                    size={16}
                    className="
                      text-emerald-400

                      shrink-0
                    "
                  />

                  <h3
                    className="
                      font-semibold
                    "
                  >
                    Incident Report
                  </h3>

                </div>


                <p
                  className="
                    text-xs
                    text-gray-500

                    leading-relaxed

                    mb-5
                  "
                >
                  Generate a tamper-evident audit
                  report with SHA-256 verification
                  and archive it under the SentriX
                  Archiving Principles.
                </p>


                <button
                  onClick={
                    handleGenerateReport
                  }
                  disabled={
                    isArchiving ||
                    !incident?.id
                  }
                  className="
                    w-full

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

                    py-3

                    rounded-lg

                    hover:opacity-90

                    transition

                    shadow-lg
                    shadow-emerald-500/10

                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >

                  {isArchiving ? (
                    <>
                      <Loader2
                        size={16}
                        className="
                          animate-spin
                        "
                      />

                      Archiving...
                    </>
                  ) : (
                    <>
                      <Download
                        size={16}
                      />

                      Generate & Archive Report
                    </>
                  )}

                </button>

              </section>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}