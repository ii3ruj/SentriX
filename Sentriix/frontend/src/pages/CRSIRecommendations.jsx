import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  Gauge,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import { apiService } from "../services/api";


/* =========================================================
   CRSI RECOMMENDATIONS
   SERVER DATA ONLY
========================================================= */

export default function CRSIRecommendations() {
  const navigate = useNavigate();


  /* =======================================================
     SERVER DATA
  ======================================================= */

  const [
    securityScore,
    setSecurityScore,
  ] = useState(null);

  const [
    maturityLevel,
    setMaturityLevel,
  ] = useState(null);

  const [
    breakdown,
    setBreakdown,
  ] = useState([]);

  const [
    recommendations,
    setRecommendations,
  ] = useState([]);

  const [
    recommendedPlaybook,
    setRecommendedPlaybook,
  ] = useState(null);

  const [
    recommendationSource,
    setRecommendationSource,
  ] = useState(null);


  /* =======================================================
     UI STATE
  ======================================================= */

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    archiving,
    setArchiving,
  ] = useState(false);


  /* =======================================================
     FETCH CRSI DATA
     BACKEND ONLY
  ======================================================= */

  useEffect(() => {
    let isMounted = true;


    const fetchCRSIInfo = async () => {
      try {

        if (isMounted) {
          setError(null);
        }


        /* =================================================
           GET DATA FROM BACKEND
        ================================================= */

        const crsiData =
          await apiService.getCRSIRecommendations();


        if (!isMounted) {
          return;
        }


        /* =================================================
           NO SERVER DATA
        ================================================= */

        if (!crsiData) {

          setError(
            "No CRSI recommendation data was returned by the server."
          );

          setSecurityScore(null);
          setMaturityLevel(null);
          setBreakdown([]);
          setRecommendations([]);
          setRecommendedPlaybook(null);
          setRecommendationSource(null);

          return;
        }


        /* =================================================
           SECURITY SCORE
        ================================================= */

        if (
          typeof crsiData.score ===
          "number"
        ) {

          setSecurityScore(
            crsiData.score
          );

        } else {

          setSecurityScore(null);

        }


        /* =================================================
           MATURITY LEVEL
        ================================================= */

        if (
          crsiData.maturity_level !==
          undefined &&
          crsiData.maturity_level !==
          null &&
          crsiData.maturity_level !== ""
        ) {

          setMaturityLevel(
            crsiData.maturity_level
          );

        } else {

          setMaturityLevel(null);

        }


        /* =================================================
           RECOMMENDATION SOURCE
           SERVER VALUE ONLY
        ================================================= */

        if (
          crsiData.source !==
            undefined &&
          crsiData.source !== null &&
          crsiData.source !== ""
        ) {

          setRecommendationSource(
            crsiData.source
          );

        } else {

          setRecommendationSource(null);

        }


        /* =================================================
           BREAKDOWN
        ================================================= */

        if (
          Array.isArray(
            crsiData.breakdown
          )
        ) {

          setBreakdown(
            crsiData.breakdown
          );

        } else {

          setBreakdown([]);

        }


        /* =================================================
           PLAYBOOK
        ================================================= */

        if (
          crsiData.playbook !==
            undefined &&
          crsiData.playbook !== null &&
          crsiData.playbook !== ""
        ) {

          setRecommendedPlaybook(
            crsiData.playbook
          );

        } else {

          setRecommendedPlaybook(
            null
          );

        }


        /* =================================================
           ACTIONS
        ================================================= */

        if (
          Array.isArray(
            crsiData.actions
          )
        ) {

          setRecommendations(
            crsiData.actions
          );

        } else {

          setRecommendations([]);

        }

      } catch (err) {

        console.error(
          "CRSI Recommendations API Error:",
          err
        );


        if (!isMounted) {
          return;
        }


        /*
         * IMPORTANT:
         *
         * NO MOCK FALLBACK.
         */

        setSecurityScore(null);
        setMaturityLevel(null);
        setBreakdown([]);
        setRecommendations([]);
        setRecommendedPlaybook(null);
        setRecommendationSource(null);


        setError(
          err?.message ||
            "Unable to load CRSI recommendations from the server."
        );

      } finally {

        if (isMounted) {
          setLoading(false);
        }

      }
    };


    fetchCRSIInfo();


    /*
     * Refresh from backend every 5 seconds.
     */

    const interval =
      setInterval(
        fetchCRSIInfo,
        5000
      );


    return () => {
      isMounted = false;
      clearInterval(interval);
    };

  }, []);


  /* =========================================================
     PRIORITY STYLE
  ========================================================= */

  const getPriorityStyle =
    (priority) => {

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


  /* =========================================================
     STATUS STYLE
  ========================================================= */

  const getStatusStyle =
    (status) => {

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


      return `
        bg-gray-500/10
        text-gray-400
        border
        border-gray-500/20
      `;
    };


  /* =========================================================
     GENERATE REPORT
  ========================================================= */

  const handleGenerateReport =
    async () => {

      if (archiving) {
        return;
      }


      if (
        securityScore === null
      ) {

        window.alert(
          "CRSI data is not available from the server yet."
        );

        return;
      }


      const confirmed =
        window.confirm(

          `Generate and archive the CRSI assessment report?\n\n` +

          `Security score: ${securityScore}/100\n` +

          `Maturity level: ${
            maturityLevel ?? "Not provided"
          }\n\n` +

          `The report is archived as an immutable snapshot with a SHA-256 fingerprint.`
        );


      if (!confirmed) {
        return;
      }


      try {

        setArchiving(true);


        const result =
          await apiService.archiveCRSIReport();


        const row =
          result?.archived;


        window.alert(

          row

            ? `CRSI report archived.\n\n` +

              `Report ID: ${
                row.report_id ??
                "Not provided"
              }\n` +

              `SHA-256: ${
                String(
                  row.sha256 ?? ""
                ).slice(
                  0,
                  32
                )
              }...\n` +

              `Archived by: ${
                row.archived_by ??
                "Not provided"
              }\n` +

              `Retention until: ${
                row.retention_until ??
                "Not provided"
              }`

            : "CRSI report archived."

        );


        navigate(
          "/archive"
        );

      } catch (e) {

        console.error(
          "CRSI archive error:",
          e
        );


        window.alert(
          `Could not archive the CRSI report: ${
            e?.message ||
            "Unknown error"
          }`
        );

      } finally {

        setArchiving(false);

      }
    };


  /* =========================================================
     SCORE COLOR
  ========================================================= */

  const scoreColor =
    securityScore === null
      ? "text-gray-500"
      : securityScore >= 70
      ? "text-emerald-400"
      : securityScore >= 40
      ? "text-yellow-400"
      : "text-red-400";


  const postureColor =
    securityScore === null
      ? "text-gray-500"
      : securityScore >= 70
      ? "text-emerald-400"
      : securityScore >= 40
      ? "text-yellow-400"
      : "text-red-400";


  /*
   * No locally calculated maturity.
   * We only display the maturity returned by backend.
   */

  const displayedMaturity =
    maturityLevel ?? null;


  /* =========================================================
     LOADING
  ========================================================= */

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


            <p
              className="
                text-sm
              "
            >
              Loading CRSI recommendations...
            </p>


            <p
              className="
                text-xs
                text-gray-600

                mt-2
              "
            >
              Loading data from the server
            </p>

          </div>

        </main>

      </div>

    );

  }


  /* =========================================================
     UI
  ========================================================= */

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

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar />


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main
        className="
          flex-1
          min-w-0

          overflow-x-hidden
        "
      >

        {/* ===================================================
            HEADER
        =================================================== */}

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
            "
          >

            <button
              onClick={() =>
                navigate(
                  "/crsi-assessment"
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
                text-emerald-400
              "
            >
              CRSI
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
            Security Recommendations
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
            Recommendations generated from the
            organization's security score and
            score breakdown.
          </p>

        </header>


        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (

          <div
            className="
              mx-4
              sm:mx-5
              md:mx-8

              mt-5

              bg-red-500/5

              border
              border-red-500/20

              rounded-xl

              p-4
            "
          >

            <div
              className="
                flex
                items-start

                gap-3
              "
            >

              <AlertCircle
                size={19}
                className="
                  text-red-400

                  shrink-0

                  mt-0.5
                "
              />


              <div
                className="
                  min-w-0
                "
              >

                <p
                  className="
                    text-sm
                    font-semibold
                    text-red-400
                  "
                >
                  Unable to load CRSI recommendations
                </p>


                <p
                  className="
                    text-xs
                    text-gray-500

                    mt-1

                    leading-relaxed

                    break-words
                  "
                >
                  {error}
                </p>

              </div>

            </div>

          </div>

        )}


        {/* ===================================================
            CONTENT
        =================================================== */}

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
              SECURITY SCORE SUMMARY
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

              mb-5

              min-w-0
            "
          >

            <div
              className="
                grid

                grid-cols-1

                sm:grid-cols-2

                lg:grid-cols-3

                gap-5
                sm:gap-6
              "
            >

              {/* SCORE */}

              <div
                className="
                  min-w-0
                "
              >

                <p
                  className="
                    text-xs
                    text-gray-500

                    mb-2
                  "
                >
                  Security Score
                </p>


                <p
                  className={`
                    text-3xl
                    font-bold

                    ${scoreColor}
                  `}
                >

                  {securityScore !==
                  null
                    ? securityScore
                    : "—"}


                  <span
                    className="
                      text-sm
                      text-gray-500
                    "
                  >
                    {" "}/ 100
                  </span>

                </p>

              </div>


              {/* POSTURE */}

              <div
                className="
                  min-w-0
                "
              >

                <p
                  className="
                    text-xs
                    text-gray-500

                    mb-2
                  "
                >
                  Security Posture
                </p>


                <p
                  className={`
                    text-lg
                    font-semibold

                    ${postureColor}
                  `}
                >

                  {displayedMaturity ??
                    "Not provided"}

                </p>

              </div>


              {/* SOURCE */}

              <div
                className="
                  min-w-0
                "
              >

                <p
                  className="
                    text-xs
                    text-gray-500

                    mb-2
                  "
                >
                  Recommendation Source
                </p>


                <p
                  className="
                    text-sm
                    text-gray-300

                    break-words
                  "
                >

                  {recommendationSource ??
                    "Not provided"}

                </p>

              </div>

            </div>

          </section>


          {/* =================================================
              TWO COLUMNS
          ================================================= */}

          <div
            className="
              grid

              grid-cols-1

              lg:grid-cols-[minmax(0,1fr)_300px]

              gap-4
              sm:gap-5

              min-w-0
            "
          >

            {/* =================================================
                LEFT COLUMN
            ================================================= */}

            <div
              className="
                space-y-5

                min-w-0
              "
            >

              {/* =================================================
                  PLAYBOOK
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

                  min-w-0
                "
              >

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

                      {recommendedPlaybook ??
                        "Not provided"}

                    </h2>


                    <p
                      className="
                        text-xs
                        text-gray-500

                        mt-2

                        leading-relaxed
                      "
                    >
                      This playbook is selected by
                      the CRSI engine based on the
                      organization's current security
                      posture.
                    </p>

                  </div>

                </div>

              </section>


              {/* =================================================
                  ACTIONS
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

                  min-w-0
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

                    mb-5
                  "
                >

                  <div
                    className="
                      min-w-0
                    "
                  >

                    <h2
                      className="
                        text-lg
                        font-semibold
                      "
                    >
                      Recommended Actions
                    </h2>


                    <p
                      className="
                        text-xs
                        text-gray-500

                        mt-1

                        leading-relaxed
                      "
                    >
                      Actions returned by the CRSI
                      recommendation engine.
                    </p>

                  </div>


                  <span
                    className="
                      text-xs
                      text-gray-500

                      shrink-0
                    "
                  >
                    {recommendations.length} actions
                  </span>

                </div>


                {recommendations.length ===
                0 ? (

                  <div
                    className="
                      border
                      border-white/5

                      rounded-xl

                      bg-[#070b16]

                      p-5

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

                    {recommendations.map(
                      (
                        item,
                        index
                      ) => {

                        return (

                          <div
                            key={
                              item.id ??
                              index
                            }
                            className="
                              bg-[#070b16]

                              border
                              border-white/5

                              rounded-xl

                              p-3
                              sm:p-4

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
                                {item.id ??
                                  index + 1}
                                .
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

                                  {item.title ??
                                    "Not provided"}

                                </p>


                                <p
                                  className="
                                    text-xs

                                    text-gray-600

                                    mt-1

                                    leading-relaxed

                                    break-words
                                  "
                                >

                                  {item.description ??
                                    "Not provided"}

                                </p>

                              </div>


                              {/* BADGES */}

                              <div
                                className="
                                  flex

                                  flex-wrap

                                  items-center

                                  gap-2

                                  pl-9

                                  sm:pl-0

                                  sm:shrink-0
                                "
                              >

                                {item.priority !==
                                  undefined &&
                                  item.priority !==
                                    null &&
                                  item.priority !==
                                    "" && (

                                    <span
                                      className={`
                                        text-[10px]

                                        px-2.5
                                        py-1

                                        rounded-full

                                        font-semibold

                                        whitespace-nowrap

                                        ${getPriorityStyle(
                                          item.priority
                                        )}
                                      `}
                                    >
                                      {
                                        item.priority
                                      }
                                    </span>

                                  )}


                                {item.status !==
                                  undefined &&
                                  item.status !==
                                    null &&
                                  item.status !==
                                    "" && (

                                    <span
                                      className={`
                                        text-[10px]

                                        px-2.5
                                        py-1

                                        rounded-full

                                        font-semibold

                                        whitespace-nowrap

                                        ${getStatusStyle(
                                          item.status
                                        )}
                                      `}
                                    >
                                      {
                                        item.status
                                      }
                                    </span>

                                  )}

                              </div>

                            </div>

                          </div>

                        );

                      }
                    )}

                  </div>

                )}

              </section>


              {/* =================================================
                  GENERATE REPORT
              ================================================= */}

              <section
                className="
                  bg-[#0c1220]

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
                    sm:gap-6
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

                      <FileText
                        size={21}
                        className="
                          text-emerald-400
                        "
                      />

                    </div>


                    <div
                      className="
                        min-w-0
                      "
                    >

                      <h2
                        className="
                          text-sm
                          font-semibold
                          text-gray-200
                        "
                      >
                        Generate CRSI Audit Report
                      </h2>


                      <p
                        className="
                          text-xs
                          text-gray-500

                          mt-1

                          leading-relaxed
                        "
                      >
                        Generate and cryptographically
                        archive this CRSI security
                        recommendations report.
                      </p>

                    </div>

                  </div>


                  <button
                    onClick={
                      handleGenerateReport
                    }
                    disabled={
                      archiving ||
                      securityScore === null
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

                      shadow-lg
                      shadow-emerald-500/10

                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >

                    {archiving ? (

                      <>
                        <Loader2
                          size={17}
                          className="
                            animate-spin
                          "
                        />

                        Archiving...
                      </>

                    ) : (

                      <>
                        <FileText
                          size={17}
                        />

                        Generate Report
                      </>

                    )}

                  </button>

                </div>

              </section>

            </div>


            {/* =================================================
                RIGHT COLUMN
            ================================================= */}

            <div
              className="
                space-y-5

                min-w-0
              "
            >

              {/* =================================================
                  BREAKDOWN
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

                <div
                  className="
                    flex
                    items-center

                    gap-2

                    mb-5
                  "
                >

                  <Gauge
                    size={17}
                    className="
                      text-emerald-400

                      shrink-0
                    "
                  />


                  <h3
                    className="
                      font-semibold

                      text-sm
                    "
                  >
                    Score Breakdown
                  </h3>

                </div>


                {breakdown.length ===
                0 ? (

                  <p
                    className="
                      text-xs
                      text-gray-600

                      italic
                    "
                  >
                    No score breakdown was
                    returned by the server.
                  </p>

                ) : (

                  <div
                    className="
                      space-y-5
                    "
                  >

                    {breakdown.map(
                      (
                        item,
                        index
                      ) => {

                        /*
                         * IMPORTANT:
                         *
                         * Do not convert missing score
                         * into 0.
                         */

                        const rawScore =
                          item?.score;


                        const hasScore =
                          rawScore !==
                            undefined &&
                          rawScore !==
                            null &&
                          rawScore !==
                            "";


                        const score =
                          hasScore
                            ? Number(
                                rawScore
                              )
                            : null;


                        const validScore =
                          score !== null &&
                          !Number.isNaN(
                            score
                          );


                        const safeScore =
                          validScore
                            ? Math.min(
                                Math.max(
                                  score,
                                  0
                                ),
                                100
                              )
                            : 0;


                        return (

                          <div
                            key={
                              item?.name ??
                              index
                            }
                            className="
                              min-w-0
                            "
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
                                  text-xs
                                  text-gray-400

                                  break-words
                                "
                              >

                                {item?.name ??
                                  "Not provided"}

                              </span>


                              <span
                                className="
                                  text-xs
                                  font-semibold

                                  whitespace-nowrap
                                "
                              >

                                {validScore
                                  ? score
                                  : "—"}

                              </span>

                            </div>


                            {validScore ? (

                              <div
                                className="
                                  h-1.5

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
                                        ? "bg-emerald-500"
                                        : score >= 40
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }
                                  `}
                                  style={{
                                    width: `${safeScore}%`,
                                  }}
                                />

                              </div>

                            ) : (

                              <div
                                className="
                                  h-1.5

                                  bg-[#172130]

                                  rounded-full
                                "
                              />

                            )}

                          </div>

                        );

                      }
                    )}

                  </div>

                )}

              </section>


              {/* =================================================
                  STATUS
              ================================================= */}

              <section
                className="
                  bg-[#0c1220]

                  border
                  border-white/10

                  rounded-2xl

                  p-4
                  sm:p-5
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

                  <Clock3
                    size={16}
                    className="
                      text-emerald-400

                      shrink-0
                    "
                  />


                  <h3
                    className="
                      font-semibold

                      text-sm
                    "
                  >
                    Recommendation Status
                  </h3>

                </div>


                <div
                  className="
                    flex
                    items-start

                    gap-2

                    text-xs
                    text-gray-500

                    leading-relaxed
                  "
                >

                  <CheckCircle2
                    size={15}
                    className="
                      text-emerald-400

                      shrink-0

                      mt-0.5
                    "
                  />


                  <span>
                    Recommendations calculated
                    and synced from the server.
                  </span>

                </div>

              </section>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}