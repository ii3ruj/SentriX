import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  FileText,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import { apiService } from "../services/api";


/* =========================================================
   INCIDENT INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
}) {
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

          sm:max-w-[60%]

          break-words
          overflow-wrap-anywhere
        "
      >

        {value || (
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
   INCIDENT DETAIL
========================================================= */

export default function IncidentDetail() {

  const {
    id,
  } = useParams();


  const [
    liveIncident,
    setLiveIncident,
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
     FETCH INCIDENT
  ======================================================= */

  useEffect(() => {

    let isMounted = true;


    const fetchDetail =
      async () => {

        if (!id) {

          setLoading(false);

          return;
        }


        try {

          const data =
            await apiService
              .getIncidentById(
                id
              );


          if (
            isMounted &&
            data
          ) {

            setLiveIncident(
              data
            );

            setError(null);

            setLoading(false);

          }

        } catch (err) {

          if (
            isMounted &&
            !liveIncident
          ) {

            setError(
              err.message ||
              "Could not load the incident."
            );

            setLoading(false);

          }

        }

      };


    if (!liveIncident) {

      setLoading(true);

    }


    setError(null);

    fetchDetail();


    return () => {

      isMounted = false;

    };

  }, [id]);


  /* =======================================================
     INCIDENT OBJECT
  ======================================================= */

  const incident =
    liveIncident
      ? (
          liveIncident.incident ||
          liveIncident
        )
      : null;


  /* =======================================================
     UI
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
      "
    >

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar />


      {/* =================================================
          MAIN
      ================================================= */}

      <div
        className="
          flex-1

          flex
          flex-col

          min-w-0

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

            px-4
            sm:px-5
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
            max-w-4xl

            p-4
            sm:p-5
            md:p-8

            space-y-5
            md:space-y-6

            pb-8
          "
        >

          {/* =================================================
              NO ID
          ================================================= */}

          {!id ? (

            <div
              className="
                bg-[#0c1220]

                border
                border-amber-500/20

                rounded-2xl

                p-5
                sm:p-8

                text-center

                space-y-3
              "
            >

              <p
                className="
                  text-gray-300
                "
              >
                No incident selected.
              </p>


              <p
                className="
                  text-xs
                  text-gray-500

                  max-w-md

                  mx-auto

                  leading-relaxed

                  break-words
                "
              >
                This is the incident detail view and needs an incident ID in the URL (for example{" "}

                <span
                  className="
                    font-mono
                    text-emerald-400
                    break-all
                  "
                >
                  /incidents/INC-0012
                </span>
                ).
              </p>


              <Link
                to="/incidents"
                className="
                  inline-flex
                  items-center
                  gap-2

                  text-sm
                  text-emerald-400

                  hover:underline
                "
              >
                Open the Incidents list
              </Link>

            </div>

          ) : loading ? (

            /* =================================================
                LOADING
            ================================================= */

            <div
              className="
                bg-[#0c1220]

                border
                border-white/10

                rounded-2xl

                p-6
                sm:p-8

                flex
                flex-col

                items-center

                gap-3

                text-gray-400
              "
            >

              <Loader2
                size={28}
                className="
                  animate-spin
                  text-emerald-400
                "
              />


              <span
                className="
                  text-sm
                  text-center
                  break-words
                "
              >
                Loading incident{" "}

                <span
                  className="
                    text-emerald-400
                    font-mono
                    break-all
                  "
                >
                  {id}
                </span>

                ...

              </span>

            </div>

          ) : !incident ? (

            /* =================================================
                NOT FOUND
            ================================================= */

            <div
              className="
                bg-[#0c1220]

                border
                border-white/10

                rounded-2xl

                p-6
                sm:p-8

                text-center

                text-gray-400

                space-y-3
              "
            >

              <p
                className="
                  break-words
                "
              >

                Incident{" "}

                <span
                  className="
                    text-emerald-400
                    font-mono
                    break-all
                  "
                >
                  {id}
                </span>

                {" "}not found.

              </p>


              {error && (

                <p
                  className="
                    text-xs
                    text-red-400
                    break-words
                  "
                >
                  {error}
                </p>

              )}


              <p
                className="
                  text-xs
                  text-gray-600

                  max-w-xl
                  mx-auto

                  leading-relaxed
                "
              >
                Older incident IDs are removed once the retention limit is reached. Open the Incidents page to see the current list.
              </p>

            </div>

          ) : (

            <>
              {/* =================================================
                  INCIDENT TITLE
              ================================================= */}

              <div
                className="
                  min-w-0
                "
              >

                <p
                  className="
                    text-sm
                    text-gray-500

                    mb-1

                    font-mono

                    break-all
                  "
                >
                  {incident.id}
                </p>


                <h1
                  className="
                    text-2xl
                    sm:text-3xl

                    font-bold

                    leading-tight

                    break-words
                  "
                >
                  {incident.title}
                </h1>

              </div>


              {/* =================================================
                  INCIDENT INFORMATION
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

                <h2
                  className="
                    text-sm
                    font-semibold
                    text-gray-300

                    mb-2
                  "
                >
                  Incident Information
                </h2>


                <InfoRow
                  label="Source"
                  value={
                    incident.source
                  }
                />


                <InfoRow
                  label="Incident Type"
                  value={
                    incident.incident_type ||
                    incident.threat_type
                  }
                />


                <InfoRow
                  label="Time"
                  value={
                    incident.time ||
                    incident.actual_incident_time ||
                    incident.created_at
                  }
                />


                <InfoRow
                  label="Source IP"
                  value={
                    incident.source_ip
                  }
                />


                <InfoRow
                  label="Destination IP"
                  value={
                    incident.destination_ip
                  }
                />


                <InfoRow
                  label="Asset Type"
                  value={
                    incident.asset_type ||
                    incident.affected_asset
                  }
                />


                <InfoRow
                  label="Asset Criticality"
                  value={
                    incident.asset_criticality ||
                    incident.severity
                  }
                />


                <InfoRow
                  label="Logged By"
                  value={
                    incident.created_by
                  }
                />


                {/* DESCRIPTION */}

                <div
                  className="
                    pt-4
                    mt-2

                    border-t
                    border-white/5

                    min-w-0
                  "
                >

                  <h2
                    className="
                      text-sm
                      font-semibold
                      text-gray-300

                      mb-2
                    "
                  >
                    Description
                  </h2>


                  <p
                    className="
                      text-sm
                      text-gray-400

                      leading-relaxed

                      break-words

                      overflow-wrap-anywhere
                    "
                  >

                    {incident.description || (

                      <span
                        className="
                          italic
                          text-gray-600
                        "
                      >
                        No description provided.
                      </span>

                    )}

                  </p>

                </div>

              </div>


              {/* =================================================
                  NOTE
              ================================================= */}

              <p
                className="
                  text-xs
                  text-gray-600
                  italic

                  leading-relaxed

                  break-words
                "
              >
                Some fields will be auto-filled from AI analysis results once available. Archived data can be found under the Archive page.
              </p>


              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2

                  gap-3

                  w-full
                "
              >

                {/* AI ANALYSIS */}

                <Link
                  to={`/ai-analysis/${incident.id}`}
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

                    px-4
                    py-3

                    rounded-xl

                    hover:opacity-90

                    transition

                    shadow-lg
                    shadow-emerald-500/10

                    text-sm
                    text-center

                    min-w-0
                  "
                >

                  <Sparkles
                    size={18}
                    className="shrink-0"
                  />

                  <span
                    className="
                      truncate
                    "
                  >
                    Proceed to AI Analysis
                  </span>

                </Link>


                {/* PDF */}

                <a
                  href={
                    apiService.archiveDownloadUrl(
                      incident.id
                    )
                  }
                  target="_blank"
                  rel="noopener noreferrer"

                  className="
                    w-full

                    flex
                    items-center
                    justify-center
                    gap-2

                    border
                    border-emerald-500/30

                    text-emerald-300

                    font-semibold

                    px-4
                    py-3

                    rounded-xl

                    hover:bg-emerald-500/10

                    transition

                    text-sm
                    text-center

                    min-w-0
                  "
                >

                  <FileText
                    size={18}
                    className="shrink-0"
                  />

                  <span
                    className="
                      truncate
                    "
                  >
                    View AI Report (PDF)
                  </span>

                </a>

              </div>

            </>

          )}

        </main>

      </div>

    </div>

  );
}