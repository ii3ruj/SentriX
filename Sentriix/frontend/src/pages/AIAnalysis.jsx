import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import {
  Gauge,
  ListChecks,
  ArrowLeft,
  LogOut,
  Bug,
  ShieldAlert,
  CheckCircle2,
  ChevronDown,
  Loader2,
  AlertCircle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import { apiService } from "../services/api";


/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({ label, value }) {
  const hasValue =
    value !== undefined &&
    value !== null &&
    value !== "";

  return (
    <div
      className="
        flex
        flex-col
        sm:flex-row

        sm:items-start
        sm:justify-between

        gap-1
        sm:gap-4

        py-3

        border-b
        border-white/5

        last:border-0

        min-w-0
      "
    >
      <span
        className="
          text-sm
          text-gray-500
          shrink-0
        "
      >
        {label}
      </span>

      <span
        className="
          text-sm
          text-gray-100
          font-medium

          sm:text-right

          sm:max-w-[65%]

          break-words
          overflow-wrap-anywhere
        "
      >
        {hasValue ? (
          value
        ) : (
          <span
            className="
              text-gray-600
              italic
            "
          >
            Not provided
          </span>
        )}
      </span>
    </div>
  );
}


/* =========================================================
   NORMALIZE AI RESPONSE
========================================================= */

function normalizeAIAnalysis(data) {
  if (!data) {
    return null;
  }

  const result =
    data.analysis ??
    data.ai_analysis ??
    data.result ??
    data;

  if (
    !result ||
    typeof result !== "object"
  ) {
    return null;
  }

  return result;
}


/* =========================================================
   NORMALIZE INCIDENT
========================================================= */

function normalizeIncident(data) {
  if (!data) {
    return null;
  }

  return data.incident ?? data;
}


/* =========================================================
   AI ANALYSIS
========================================================= */

export default function AIAnalysis() {
  const { id } = useParams();

  const [
    userMenuOpen,
    setUserMenuOpen,
  ] = useState(false);

  const [
    incident,
    setIncident,
  ] = useState(null);

  const [
    analysis,
    setAnalysis,
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
    let mounted = true;


    if (!id) {
      setLoading(false);

      setError(
        "No incident ID was provided."
      );

      return;
    }


    const fetchData =
      async () => {
        try {
          if (mounted) {
            setError(null);
          }


          /*
           * SERVER ONLY
           *
           * No mock data.
           * No localStorage.
           * No static incident fallback.
           */

          const [
            incidentResponse,
            aiResponse,
          ] = await Promise.all([
            apiService.getIncidentById(id),
            apiService.getAIAnalysis(id),
          ]);


          if (!mounted) {
            return;
          }


          const realIncident =
            normalizeIncident(
              incidentResponse
            );


          const realAnalysis =
            normalizeAIAnalysis(
              aiResponse
            );


          setIncident(
            realIncident
          );

          setAnalysis(
            realAnalysis
          );


          if (!realIncident) {
            setError(
              `Incident ${id} was not found on the server.`
            );
          }

        } catch (err) {

          console.error(
            "AI Analysis API Error:",
            err
          );


          if (!mounted) {
            return;
          }


          /*
           * IMPORTANT:
           *
           * If server fails:
           * do NOT show old/mock data.
           */

          setIncident(null);
          setAnalysis(null);

          setError(
            err?.message ||
              "Unable to load incident analysis from the server."
          );

        } finally {

          if (mounted) {
            setLoading(false);
          }

        }
      };


    fetchData();


    /*
     * AI analysis may finish after
     * the incident is uploaded.
     *
     * Therefore we keep checking
     * the real backend.
     */

    const interval =
      setInterval(
        fetchData,
        4000
      );


    return () => {
      mounted = false;
      clearInterval(interval);
    };

  }, [id]);


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout =
    () => {
      apiService.logout();
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
              max-w-sm
            "
          >

            <Loader2
              size={34}
              className="
                animate-spin

                text-emerald-400

                mx-auto

                mb-4
              "
            />

            <p
              className="
                text-sm
                text-gray-400
              "
            >
              Loading AI analysis...
            </p>

            <p
              className="
                text-xs
                text-gray-600

                font-mono

                mt-2

                break-all
              "
            >
              {id}
            </p>

          </div>

        </main>

      </div>
    );
  }


  /* =======================================================
     INCIDENT NOT FOUND / API ERROR
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
              max-w-md

              bg-[#0c1220]

              border
              border-red-500/20

              rounded-2xl

              p-5
              sm:p-8

              text-center
            "
          >

            <AlertCircle
              size={36}
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
              Incident Not Found
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
                `Incident ${id} could not be found on the server.`}
            </p>


            <Link
              to="/incidents"
              className="
                inline-flex

                items-center

                justify-center

                gap-2

                mt-6

                px-4
                py-2.5

                rounded-lg

                text-sm

                text-emerald-400

                bg-emerald-500/10

                border
                border-emerald-500/20

                hover:bg-emerald-500/15

                transition
              "
            >

              <ArrowLeft
                size={15}
              />

              Back to Incidents

            </Link>

          </div>

        </main>

      </div>
    );
  }


  /* =======================================================
     AI ANALYSIS NOT READY
  ======================================================= */

  if (!analysis) {
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

        <div
          className="
            flex-1

            min-w-0

            flex
            flex-col
          "
        >

          {/* HEADER */}

          <header
            className="
              flex
              items-center
              justify-between

              gap-3

              px-4
              sm:px-6
              md:px-8

              py-4

              border-b
              border-white/10
            "
          >

            <Link
              to="/incidents"
              className="
                inline-flex

                items-center

                gap-2

                text-sm
                text-gray-400

                hover:text-gray-200

                transition

                min-w-0
              "
            >

              <ArrowLeft
                size={16}
                className="shrink-0"
              />

              <span
                className="
                  hidden
                  sm:inline
                "
              >
                Back to Incidents
              </span>

              <span
                className="
                  sm:hidden
                "
              >
                Back
              </span>

            </Link>


            {/* USER MENU */}

            <div
              className="
                relative
                shrink-0
              "
            >

              <button
                onClick={() =>
                  setUserMenuOpen(
                    (prev) =>
                      !prev
                  )
                }
                className="
                  flex
                  items-center

                  gap-2
                "
              >

                <div
                  className="
                    w-8
                    h-8

                    rounded-full

                    bg-emerald-500/20

                    flex
                    items-center
                    justify-center

                    text-emerald-400

                    text-xs
                    font-bold
                  "
                >
                  A
                </div>


                <div
                  className="
                    hidden
                    sm:block

                    text-xs
                    text-left
                  "
                >

                  <p
                    className="
                      font-semibold
                    "
                  >
                    Analyst
                  </p>

                  <p
                    className="
                      text-gray-500
                    "
                  >
                    SOC Analyst
                  </p>

                </div>


                <ChevronDown
                  size={14}

                  className={`
                    text-gray-500

                    transition-transform

                    ${
                      userMenuOpen
                        ? "rotate-180"
                        : ""
                    }
                  `}
                />

              </button>


              {userMenuOpen && (
                <div
                  className="
                    absolute

                    right-0
                    top-full

                    mt-2

                    w-40

                    bg-[#0c1220]

                    border
                    border-white/10

                    rounded-lg

                    shadow-lg

                    overflow-hidden

                    z-50
                  "
                >

                  <button
                    onClick={
                      handleLogout
                    }
                    className="
                      flex
                      items-center

                      gap-2

                      w-full

                      px-4
                      py-2.5

                      text-sm

                      text-red-400

                      hover:bg-red-500/10

                      transition
                    "
                  >

                    <LogOut
                      size={14}
                    />

                    Logout

                  </button>

                </div>
              )}

            </div>

          </header>


          {/* PROGRESS */}

          <main
            className="
              flex-1

              flex
              items-center
              justify-center

              p-4
              sm:p-6
              md:p-8
            "
          >

            <div
              className="
                w-full
                max-w-lg

                bg-[#0c1220]

                border
                border-amber-500/20

                rounded-2xl

                p-5
                sm:p-8

                text-center
              "
            >

              <Loader2
                size={36}
                className="
                  text-amber-400

                  animate-spin

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
                AI Analysis in Progress
              </h2>


              <p
                className="
                  text-sm
                  text-gray-400

                  leading-relaxed
                "
              >
                The incident was received by
                the server, but the AI analysis
                result is not available yet.
              </p>


              <p
                className="
                  text-xs
                  text-gray-600

                  mt-3

                  font-mono

                  break-all
                "
              >
                {incident.id}
              </p>

            </div>

          </main>

        </div>

      </div>
    );
  }


  /* =======================================================
     SERVER VALUES ONLY
  ======================================================= */

  const severity =
    analysis.severity ??
    incident.severity ??
    null;


  const threatType =
    analysis.threat_type ??
    incident.incident_type ??
    incident.threat_type ??
    null;


  const threatCategory =
    analysis.threat_category ??
    incident.threat_category ??
    null;


  const riskDetected =
    analysis.risk_detected;


  const riskScore =
    analysis.risk_score;


  const incidentTitle =
    analysis.incident_title ??
    incident.title ??
    null;


  const incidentTime =
    incident.time ??
    incident.actual_incident_time ??
    incident.created_at ??
    null;


  const source =
    incident.source ??
    null;


  const asset =
    incident.asset_type ??
    incident.affected_asset ??
    null;


  const assetCriticality =
    incident.asset_criticality;


  const analysisId =
    analysis.analysis_id ??
    analysis.id ??
    null;


  const modelUsed =
    analysis.model_used ??
    null;


  const analysisTime =
    analysis.analysis_time ??
    analysis.created_at ??
    null;


  const dataSources =
    analysis.data_sources;


  const mitreTactics =
    analysis.mitre_tactics;


  const attackTechnique =
    analysis.attack_technique;


  const keyFindings =
    Array.isArray(
      analysis.key_findings
    )
      ? analysis.key_findings
      : Array.isArray(
          analysis.findings
        )
      ? analysis.findings
      : [];


  const riskIsKnown =
    typeof riskDetected ===
    "boolean";


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


      <div
        className="
          flex-1

          min-w-0

          flex
          flex-col

          overflow-x-hidden
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            flex
            items-center
            justify-between

            gap-3

            px-4
            sm:px-6
            md:px-8

            py-4

            border-b
            border-white/10

            min-w-0
          "
        >

          <Link
            to="/incidents"
            className="
              inline-flex

              items-center

              gap-2

              text-sm
              text-gray-400

              hover:text-gray-200

              transition

              min-w-0
            "
          >

            <ArrowLeft
              size={16}
              className="shrink-0"
            />

            <span
              className="
                truncate
              "
            >
              Back to Incidents
            </span>

          </Link>


          {/* USER */}

          <div
            className="
              relative
              shrink-0
            "
          >

            <button
              onClick={() =>
                setUserMenuOpen(
                  (prev) =>
                    !prev
                )
              }
              className="
                flex
                items-center

                gap-2
              "
            >

              <div
                className="
                  w-8
                  h-8

                  rounded-full

                  bg-emerald-500/20

                  flex
                  items-center
                  justify-center

                  text-emerald-400

                  text-xs
                  font-bold
                "
              >
                A
              </div>


              <div
                className="
                  hidden
                  sm:block

                  text-xs
                  text-left
                "
              >

                <p
                  className="
                    font-semibold
                  "
                >
                  Analyst
                </p>

                <p
                  className="
                    text-gray-500
                  "
                >
                  SOC Analyst
                </p>

              </div>


              <ChevronDown
                size={14}

                className={`
                  text-gray-500

                  transition-transform

                  ${
                    userMenuOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />

            </button>


            {userMenuOpen && (
              <div
                className="
                  absolute

                  right-0
                  top-full

                  mt-2

                  w-40

                  bg-[#0c1220]

                  border
                  border-white/10

                  rounded-lg

                  shadow-lg

                  overflow-hidden

                  z-50
                "
              >

                <button
                  onClick={
                    handleLogout
                  }
                  className="
                    flex
                    items-center

                    gap-2

                    w-full

                    px-4
                    py-2.5

                    text-sm

                    text-red-400

                    hover:bg-red-500/10

                    transition
                  "
                >

                  <LogOut
                    size={14}
                  />

                  Logout

                </button>

              </div>
            )}

          </div>

        </header>


        {/* =================================================
            CONTENT
        ================================================= */}

        <main
          className="
            flex-1

            overflow-y-auto
            overflow-x-hidden

            w-full

            p-4
            sm:p-5
            md:p-8

            space-y-5
            md:space-y-6

            pb-8

            min-w-0
          "
        >

          {/* =================================================
              TITLE
          ================================================= */}

          <div
            className="
              min-w-0
            "
          >

            <h1
              className="
                text-2xl
                sm:text-3xl

                font-bold
              "
            >
              AI Analysis
            </h1>


            <p
              className="
                text-gray-400

                text-sm

                mt-1

                leading-relaxed
              "
            >
              AI-driven analysis and anomaly
              scoring for the selected incident
            </p>

          </div>


          {/* =================================================
              INCIDENT SUMMARY
          ================================================= */}

          <div
            className="
              bg-[#0c1220]

              border
              border-white/10

              rounded-xl

              p-4
              sm:p-5

              flex
              flex-col
              sm:flex-row

              sm:items-center
              sm:justify-between

              gap-4

              min-w-0
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
                  w-10
                  h-10

                  rounded-lg

                  bg-red-500/15

                  flex
                  items-center
                  justify-center

                  text-red-400

                  shrink-0
                "
              >

                <ShieldAlert
                  size={20}
                />

              </div>


              <div
                className="
                  min-w-0
                "
              >

                <p
                  className="
                    font-semibold
                    font-mono

                    break-all
                  "
                >
                  {incident.id}
                </p>


                <p
                  className="
                    text-sm
                    text-gray-400

                    break-words

                    leading-relaxed
                  "
                >
                  {incidentTitle ??
                    "Not provided"}
                </p>


                <p
                  className="
                    text-xs
                    text-gray-600

                    mt-1

                    break-words

                    leading-relaxed
                  "
                >
                  {incidentTime ??
                    "Not provided"}

                  {" • "}

                  {source ??
                    "Not provided"}

                  {" • "}

                  {asset ??
                    "Not provided"}
                </p>

              </div>

            </div>


            <span
              className="
                flex
                items-center

                gap-1.5

                bg-white/5

                text-gray-300

                border
                border-white/10

                px-3
                py-1.5

                rounded-full

                text-xs
                font-semibold

                self-start
                sm:self-auto

                whitespace-nowrap
              "
            >

              <span
                className="
                  w-1.5
                  h-1.5

                  rounded-full

                  bg-gray-400
                "
              />

              {severity ??
                "Not provided"}

            </span>

          </div>


          {/* =================================================
              THREAT / RISK / SEVERITY
          ================================================= */}

          <div
            className="
              grid

              grid-cols-1

              sm:grid-cols-2

              lg:grid-cols-3

              gap-3
              sm:gap-4
            "
          >

            {/* THREAT */}

            <div
              className="
                bg-[#0c1220]

                border
                border-white/10

                rounded-xl

                p-5
                sm:p-6

                flex
                flex-col
                items-center

                text-center

                min-w-0
              "
            >

              <p
                className="
                  text-sm
                  font-semibold
                  text-gray-300

                  mb-3
                "
              >
                Threat Type
              </p>


              <div
                className="
                  w-12
                  h-12

                  rounded-full

                  bg-purple-500/15

                  flex
                  items-center
                  justify-center

                  text-purple-400

                  mb-3
                "
              >

                <Bug
                  size={22}
                />

              </div>


              <p
                className="
                  text-lg
                  font-bold

                  text-purple-300

                  break-words

                  max-w-full
                "
              >
                {threatType ??
                  "Not provided"}
              </p>


              <p
                className="
                  text-xs
                  text-gray-500

                  break-words

                  mt-1
                "
              >
                {threatCategory ??
                  "Not provided"}
              </p>

            </div>


            {/* RISK */}

            <div
              className="
                bg-[#0c1220]

                border
                border-white/10

                rounded-xl

                p-5
                sm:p-6

                flex
                flex-col
                items-center

                text-center

                min-w-0
              "
            >

              <p
                className="
                  text-sm
                  font-semibold
                  text-gray-300

                  mb-3
                "
              >
                Risk Assessment
              </p>


              <div
                className={`
                  w-12
                  h-12

                  rounded-full

                  flex
                  items-center
                  justify-center

                  mb-3

                  ${
                    riskDetected === true
                      ? "bg-red-500/15 text-red-400"
                      : riskDetected === false
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-gray-500/10 text-gray-400"
                  }
                `}
              >

                <Gauge
                  size={22}
                />

              </div>


              {!riskIsKnown ? (

                <>
                  <p
                    className="
                      text-lg
                      font-bold

                      text-gray-300
                    "
                  >
                    Not provided
                  </p>

                  <p
                    className="
                      text-xs
                      text-gray-500

                      leading-relaxed
                    "
                  >
                    Waiting for server result
                  </p>
                </>

              ) : riskDetected ? (

                <>
                  <p
                    className="
                      text-lg
                      font-bold

                      text-red-400
                    "
                  >

                    {riskScore ??
                      "Not provided"}

                    {riskScore !==
                      undefined &&
                      riskScore !==
                        null && (
                        <span
                          className="
                            text-sm
                            text-gray-500
                          "
                        >
                          {" "}/ 100
                        </span>
                      )}

                  </p>


                  <p
                    className="
                      text-xs
                      text-gray-500
                    "
                  >
                    Risk Detected
                  </p>
                </>

              ) : (

                <>
                  <p
                    className="
                      text-lg
                      font-bold

                      text-emerald-400
                    "
                  >
                    No Risk Detected
                  </p>

                  <p
                    className="
                      text-xs
                      text-gray-500

                      leading-relaxed
                    "
                  >
                    Server reported no detected risk
                  </p>
                </>

              )}

            </div>


            {/* SEVERITY */}

            <div
              className="
                bg-[#0c1220]

                border
                border-white/10

                rounded-xl

                p-5
                sm:p-6

                flex
                flex-col
                items-center

                text-center

                min-w-0

                sm:col-span-2

                lg:col-span-1
              "
            >

              <p
                className="
                  text-sm
                  font-semibold
                  text-gray-300

                  mb-3
                "
              >
                Severity
              </p>


              <div
                className="
                  w-12
                  h-12

                  rounded-full

                  bg-red-500/15

                  flex
                  items-center
                  justify-center

                  text-red-400

                  mb-3
                "
              >

                <ShieldAlert
                  size={22}
                />

              </div>


              <p
                className="
                  text-lg
                  font-bold

                  text-gray-300

                  break-words
                "
              >
                {severity ??
                  "Not provided"}
              </p>


              <p
                className="
                  text-xs
                  text-gray-500

                  leading-relaxed

                  mt-1
                "
              >
                {riskDetected === true
                  ? "Risk reported by AI service"
                  : riskDetected === false
                  ? "No risk reported by AI service"
                  : "Risk status not provided"}
              </p>

            </div>

          </div>


          {/* =================================================
              NO RISK
          ================================================= */}

          {riskDetected === false && (

            <div
              className="
                bg-emerald-500/5

                border
                border-emerald-500/20

                rounded-xl

                p-4
                sm:p-5
              "
            >

              <div
                className="
                  flex
                  items-start

                  gap-3
                "
              >

                <CheckCircle2
                  size={20}
                  className="
                    text-emerald-400

                    shrink-0

                    mt-0.5
                  "
                />


                <div
                  className="
                    min-w-0
                  "
                >

                  <h3
                    className="
                      text-sm
                      font-semibold

                      text-emerald-400
                    "
                  >
                    No Security Risk Detected
                  </h3>


                  <p
                    className="
                      text-sm
                      text-gray-400

                      mt-1

                      leading-relaxed
                    "
                  >
                    The AI service reported no
                    significant security risk for
                    this incident.
                  </p>

                </div>

              </div>

            </div>

          )}


          {/* =================================================
              AI SUMMARY
          ================================================= */}

          <div
            className="
              bg-[#0c1220]

              border
              border-white/10

              rounded-xl

              p-4
              sm:p-5
              md:p-6

              min-w-0
            "
          >

            <div
              className="
                flex
                items-center

                gap-2

                mb-4
              "
            >

              <ListChecks
                size={17}
                className="
                  text-emerald-400
                  shrink-0
                "
              />

              <h2
                className="
                  text-sm
                  font-semibold
                  text-gray-200
                "
              >
                AI Analysis Summary
              </h2>

            </div>


            <div
              className="
                grid

                grid-cols-1

                lg:grid-cols-2

                gap-5
                lg:gap-8
              "
            >

              {/* LEFT */}

              <div
                className="
                  min-w-0
                "
              >

                <InfoRow
                  label="Analysis ID"
                  value={analysisId}
                />

                <InfoRow
                  label="Model Used"
                  value={modelUsed}
                />

                <InfoRow
                  label="Analysis Time"
                  value={analysisTime}
                />

                <InfoRow
                  label="Data Sources"
                  value={dataSources}
                />

                <InfoRow
                  label="MITRE ATT&CK Tactics"
                  value={mitreTactics}
                />

                <InfoRow
                  label="Attack Technique"
                  value={attackTechnique}
                />

                <InfoRow
                  label="Asset Criticality"
                  value={assetCriticality}
                />

              </div>


              {/* RIGHT */}

              <div
                className="
                  min-w-0
                "
              >

                <p
                  className="
                    text-sm
                    font-semibold
                    text-gray-300

                    mb-3
                  "
                >
                  Key Findings
                </p>


                {keyFindings.length >
                0 ? (

                  <ul
                    className="
                      space-y-3
                    "
                  >

                    {keyFindings.map(
                      (
                        finding,
                        index
                      ) => (

                        <li
                          key={index}
                          className="
                            flex
                            items-start

                            gap-2

                            text-sm
                            text-gray-300

                            leading-relaxed

                            min-w-0
                          "
                        >

                          <CheckCircle2
                            size={16}
                            className="
                              text-emerald-400

                              shrink-0

                              mt-0.5
                            "
                          />


                          <span
                            className="
                              break-words

                              overflow-wrap-anywhere
                            "
                          >
                            {finding}
                          </span>

                        </li>

                      )
                    )}

                  </ul>

                ) : (

                  <p
                    className="
                      text-sm
                      text-gray-600

                      italic

                      leading-relaxed
                    "
                  >
                    No key findings were
                    returned by the AI service.
                  </p>

                )}

              </div>

            </div>

          </div>


          {/* =================================================
              RECOMMENDATIONS
          ================================================= */}

          {riskDetected === true && (

            <div
              className="
                text-center

                px-2
              "
            >

              <Link
                to={`/recommendations/${id}`}
                className="
                  inline-flex

                  items-center
                  justify-center

                  gap-2

                  border-2
                  border-dashed
                  border-emerald-500/40

                  text-emerald-400

                  px-5
                  sm:px-6

                  py-3

                  rounded-xl

                  text-sm
                  font-semibold

                  hover:bg-emerald-500/5

                  transition

                  max-w-full
                "
              >
                View Recommendations →
              </Link>


              <p
                className="
                  text-xs
                  text-gray-600

                  mt-2

                  leading-relaxed
                "
              >
                View AI recommendations and
                mitigation playbooks based on
                this incident's risk score.
              </p>

            </div>

          )}

        </main>

      </div>

    </div>
  );
}