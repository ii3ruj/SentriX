import React, { useState, useEffect } from "react";

import {
  Download,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
  UserCheck,
  FileCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import { apiService } from "../services/api";


/* =========================================================
   ARCHIVE PAGE
   SERVER DATA ONLY
========================================================= */

export default function Archive() {
  /* =======================================================
     SERVER DATA
  ======================================================= */

  const [
    reportsList,
    setReportsList,
  ] = useState([]);


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
    verifiedId,
    setVerifiedId,
  ] = useState(null);


  const [
    verifyingId,
    setVerifyingId,
  ] = useState(null);


  /* =======================================================
     FETCH ARCHIVE
     SERVER ONLY
  ======================================================= */

  useEffect(() => {
    let isMounted = true;


    const fetchArchive = async () => {
      try {
        if (isMounted) {
          setError(null);
        }


        const liveArchived =
          await apiService.getArchivedIncidents();


        if (!isMounted) {
          return;
        }


        /*
         * Backend may return:
         *
         * 1. Array
         * 2. { incidents: [] }
         * 3. { reports: [] }
         * 4. { data: [] }
         */

        let records = [];


        if (Array.isArray(liveArchived)) {
          records = liveArchived;

        } else if (
          Array.isArray(
            liveArchived?.reports
          )
        ) {
          records =
            liveArchived.reports;

        } else if (
          Array.isArray(
            liveArchived?.incidents
          )
        ) {
          records =
            liveArchived.incidents;

        } else if (
          Array.isArray(
            liveArchived?.data
          )
        ) {
          records =
            liveArchived.data;
        }


        /*
         * Format ONLY the data returned
         * by the backend.
         *
         * No fake reports.
         */

        const formatted =
          records.map(
            (item, idx) => ({
              id:
                item.report_id ??
                item.reportId ??
                item.id ??
                `REPORT-${idx + 1}`,

              incidentId:
                item.incident_id ??
                item.incidentId ??
                null,

              title:
                item.title ??
                item.report_title ??
                item.reportTitle ??
                (
                  item.incident_id
                    ? `Incident Report - ${item.incident_id}`
                    : "Archived Security Report"
                ),

              type:
                item.type ??
                item.report_type ??
                (
                  item.is_crsi ||
                  item.isCRSI
                    ? "CRSI Report"
                    : "Incident Report"
                ),

              archivedAt:
                item.archived_at ??
                item.archivedAt ??
                item.created_at ??
                item.createdAt ??
                "-",

              sha256:
                item.sha256 ??
                item.hash ??
                "",

              archivedBy:
                item.archived_by ??
                item.archivedBy ??
                "-",

              retentionUntil:
                item.retention_until ??
                item.retentionUntil ??
                "-",

              storageType:
                item.storage_type ??
                item.storageType ??
                "WORM (Immutable)",

              isCrsi:
                Boolean(
                  item.is_crsi ??
                  item.isCrsi ??
                  (
                    item.type ===
                    "CRSI Report"
                  )
                ),

              content:
                item.content ??
                item,
            })
          );


        setReportsList(
          formatted
        );


      } catch (err) {

        console.error(
          "Archive API Error:",
          err
        );


        if (!isMounted) {
          return;
        }


        /*
         * IMPORTANT:
         *
         * NO FALLBACK.
         * NO MOCK DATA.
         */

        setReportsList([]);


        setError(
          err?.message ||
          "Unable to load archived reports from the server."
        );


      } finally {

        if (isMounted) {
          setLoading(false);
        }

      }
    };


    fetchArchive();


    /*
     * Refresh archive from server
     * every 5 seconds.
     */

    const interval =
      setInterval(
        fetchArchive,
        5000
      );


    return () => {
      isMounted = false;
      clearInterval(interval);
    };

  }, []);


  /* =======================================================
     VERIFY HASH
     SERVER ONLY
  ======================================================= */

  const handleVerify =
    async (report) => {

      if (
        !report?.incidentId
      ) {

        window.alert(
          "This archive record does not have an incident ID that can be verified."
        );

        return;
      }


      setVerifyingId(
        report.id
      );


      setVerifiedId(
        null
      );


      try {

        const data =
          await apiService.verifyArchiveHash(
            report.incidentId
          );


        if (
          data?.integrity_ok
        ) {

          setVerifiedId(
            report.id
          );


          window.alert(
            `Integrity verification PASSED for ${report.id}.\n\n` +
            `Stored SHA-256:\n${data.stored_sha256 || "-"}\n\n` +
            `Current SHA-256:\n${data.current_sha256 || "-"}`
          );

        } else {

          window.alert(
            `Integrity verification FAILED for ${report.id}.\n\n` +
            `Stored SHA-256:\n${data?.stored_sha256 || "-"}\n\n` +
            `Current SHA-256:\n${data?.current_sha256 || "-"}`
          );

        }


      } catch (err) {

        console.error(
          "Archive verification error:",
          err
        );


        window.alert(
          `Could not verify the archive record: ${
            err?.message ||
            "Unknown error"
          }`
        );

      } finally {

        setVerifyingId(
          null
        );

      }
    };


  /* =======================================================
     DOWNLOAD REPORT
     -------------------------------------------------------
     Official backend PDF only.
     No locally generated fake reports.
  ======================================================= */

  const downloadReport =
    (report) => {

      if (
        !report?.incidentId
      ) {

        window.alert(
          "This archived report does not have an incident ID, so the official PDF cannot be downloaded."
        );

        return;
      }


      const url =
        apiService.archiveDownloadUrl(
          report.incidentId
        );


      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
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

            p-6
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
              Loading archive...
            </p>


            <p
              className="
                text-xs
                text-gray-600
                mt-2
              "
            >
              Loading archived reports from the server
            </p>

          </div>

        </main>

      </div>
    );
  }


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

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar />


      {/* =====================================================
          MAIN
      ===================================================== */}

      <div
        className="
          flex-1

          flex
          flex-col

          min-w-0

          overflow-x-hidden
        "
      >

        {/* ===================================================
            HEADER
        =================================================== */}

        <header
          className="
            flex

            flex-col
            sm:flex-row

            sm:items-center
            sm:justify-between

            gap-3

            px-4
            sm:px-5
            md:px-8

            py-4

            border-b
            border-white/10
          "
        >

          <div
            className="
              flex
              items-center

              gap-2

              text-[10px]
              sm:text-xs

              text-emerald-400

              bg-emerald-500/10

              border
              border-emerald-500/20

              px-3
              py-2

              rounded-full

              w-fit

              max-w-full
            "
          >

            <Lock
              size={13}
              className="
                shrink-0
              "
            />


            <span
              className="
                leading-relaxed
              "
            >
              Archive Compliance: P1 Integrity | P2 Immutability | P3 Retention | P4 Traceability
            </span>

          </div>


          <div
            className="
              text-[11px]
              sm:text-xs

              text-gray-500

              sm:text-right
            "
          >
            Archived Reports & Cryptographic Proofs
          </div>

        </header>


        {/* ===================================================
            CONTENT
        =================================================== */}

        <main
          className="
            flex-1

            overflow-y-auto

            p-4
            sm:p-5
            md:p-8

            space-y-5
            sm:space-y-6

            min-w-0
          "
        >

          {/* =================================================
              PAGE TITLE
          ================================================= */}

          <div
            className="
              flex

              flex-col
              xl:flex-row

              xl:items-center
              xl:justify-between

              gap-5
            "
          >

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

                  leading-tight
                "
              >
                Archive Repository
              </h1>


              <p
                className="
                  text-gray-400
                  text-sm

                  mt-1

                  max-w-3xl

                  leading-relaxed
                "
              >
                Tamper-evident, immutable audit trail for security incidents and CRSI assessments
              </p>

            </div>


            {/* =================================================
                COMPLIANCE INDICATORS
            ================================================= */}

            <div
              className="
                flex

                flex-wrap

                items-center

                gap-2
                sm:gap-4

                text-[11px]
                sm:text-xs

                text-gray-400
              "
            >

              <span
                className="
                  flex
                  items-center
                  gap-1.5

                  whitespace-nowrap
                "
              >

                <ShieldCheck
                  size={14}
                  className="
                    text-emerald-400
                  "
                />

                SHA-256 Verified

              </span>


              <span
                className="
                  flex
                  items-center
                  gap-1.5

                  whitespace-nowrap
                "
              >

                <Lock
                  size={14}
                  className="
                    text-blue-400
                  "
                />

                Write-Once Storage

              </span>


              <span
                className="
                  flex
                  items-center
                  gap-1.5

                  whitespace-nowrap
                "
              >

                <Clock
                  size={14}
                  className="
                    text-amber-400
                  "
                />

                Retention Monitored

              </span>

            </div>

          </div>


          {/* =================================================
              SERVER ERROR
          ================================================= */}

          {error && (

            <div
              className="
                bg-red-500/5

                border
                border-red-500/20

                rounded-xl

                p-4

                flex
                items-start

                gap-3
              "
            >

              <AlertCircle
                size={18}
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
                  Unable to load archive
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

          )}


          {/* =================================================
              ARCHIVE TABLE
          ================================================= */}

          <div
            className="
              bg-[#0c1220]

              border
              border-white/10

              rounded-xl

              p-3
              sm:p-4
              md:p-5

              overflow-x-auto

              min-w-0
            "
          >

            <div
              className="
                min-w-[950px]
              "
            >

              <table
                className="
                  w-full

                  text-sm
                "
              >

                <thead>

                  <tr
                    className="
                      text-left

                      text-gray-500

                      text-xs

                      border-b
                      border-white/10
                    "
                  >

                    <th
                      className="
                        pb-3
                        pr-4

                        font-normal

                        whitespace-nowrap
                      "
                    >
                      Report ID
                    </th>


                    <th
                      className="
                        pb-3
                        pr-4

                        font-normal
                      "
                    >
                      Title
                    </th>


                    <th
                      className="
                        pb-3
                        pr-4

                        font-normal

                        whitespace-nowrap
                      "
                    >
                      Type
                    </th>


                    <th
                      className="
                        pb-3
                        pr-4

                        font-normal
                      "
                    >
                      P1: SHA-256 Hash
                    </th>


                    <th
                      className="
                        pb-3
                        pr-4

                        font-normal
                      "
                    >
                      P4: Traceability
                    </th>


                    <th
                      className="
                        pb-3
                        pr-4

                        font-normal

                        whitespace-nowrap
                      "
                    >
                      Archived Date
                    </th>


                    <th
                      className="
                        pb-3

                        font-normal

                        text-center

                        whitespace-nowrap
                      "
                    >
                      Verify & Download
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {reportsList.map(
                    (report) => {

                      const isCurrentlyVerified =
                        verifiedId ===
                        report.id;


                      const isCurrentlyVerifying =
                        verifyingId ===
                        report.id;


                      return (

                        <tr
                          key={
                            report.id
                          }
                          className="
                            border-b
                            border-white/5

                            last:border-0

                            hover:bg-white/[0.02]

                            transition
                          "
                        >

                          {/* REPORT ID */}

                          <td
                            className="
                              py-3.5
                              pr-4

                              text-gray-300

                              font-medium
                            "
                          >

                            <div
                              className="
                                flex
                                items-center

                                gap-2
                              "
                            >

                              <FileCheck
                                size={15}
                                className="
                                  text-emerald-400

                                  shrink-0
                                "
                              />


                              <span
                                className="
                                  break-all
                                "
                              >
                                {report.id}
                              </span>

                            </div>

                          </td>


                          {/* TITLE */}

                          <td
                            className="
                              py-3.5
                              pr-4

                              text-gray-200

                              max-w-[260px]
                            "
                          >

                            <span
                              className="
                                block

                                truncate
                              "
                              title={
                                report.title
                              }
                            >
                              {report.title}
                            </span>

                          </td>


                          {/* TYPE */}

                          <td
                            className="
                              py-3.5
                              pr-4
                            "
                          >

                            <span
                              className={`
                                text-xs

                                px-2
                                py-0.5

                                rounded-full

                                border

                                whitespace-nowrap

                                ${
                                  report.type ===
                                  "CRSI Report"

                                    ? `
                                      bg-emerald-500/10
                                      text-emerald-400
                                      border-emerald-500/30
                                    `

                                    : `
                                      bg-blue-500/10
                                      text-blue-400
                                      border-blue-500/30
                                    `
                                }
                              `}
                            >
                              {report.type}
                            </span>

                          </td>


                          {/* HASH */}

                          <td
                            className="
                              py-3.5
                              pr-4
                            "
                          >

                            <div
                              className="
                                flex
                                items-center

                                gap-1.5
                              "
                            >

                              <code
                                className="
                                  text-[11px]

                                  font-mono

                                  bg-[#070b16]

                                  px-2
                                  py-0.5

                                  rounded

                                  border
                                  border-white/10

                                  text-gray-400

                                  max-w-[130px]

                                  truncate
                                "
                                title={
                                  report.sha256 ||
                                  ""
                                }
                              >
                                {report.sha256 ||
                                  "—"}
                              </code>


                              <button
                                onClick={() =>
                                  handleVerify(
                                    report
                                  )
                                }
                                disabled={
                                  isCurrentlyVerifying
                                }
                                className="
                                  text-[11px]

                                  text-emerald-400

                                  hover:text-emerald-300

                                  transition

                                  underline

                                  ml-1

                                  whitespace-nowrap

                                  disabled:opacity-50
                                  disabled:cursor-not-allowed
                                "
                                title="Verify Hash against stored ledger"
                              >

                                {isCurrentlyVerifying ? (

                                  <span
                                    className="
                                      flex
                                      items-center

                                      gap-1
                                    "
                                  >

                                    <Loader2
                                      size={12}
                                      className="
                                        animate-spin
                                      "
                                    />

                                    Checking

                                  </span>

                                ) : isCurrentlyVerified ? (

                                  <span
                                    className="
                                      flex
                                      items-center

                                      gap-1

                                      text-emerald-400

                                      font-semibold
                                    "
                                  >

                                    <CheckCircle2
                                      size={12}
                                    />

                                    Match

                                  </span>

                                ) : (

                                  "Verify"

                                )}

                              </button>

                            </div>

                          </td>


                          {/* TRACEABILITY */}

                          <td
                            className="
                              py-3.5
                              pr-4

                              text-xs
                              text-gray-400
                            "
                          >

                            <div
                              className="
                                flex
                                items-center

                                gap-1.5
                              "
                            >

                              <UserCheck
                                size={13}
                                className="
                                  text-gray-500

                                  shrink-0
                                "
                              />


                              <span>
                                {report.archivedBy ||
                                  "—"}
                              </span>

                            </div>

                          </td>


                          {/* DATE */}

                          <td
                            className="
                              py-3.5
                              pr-4

                              text-xs
                              text-gray-500

                              whitespace-nowrap
                            "
                          >
                            {report.archivedAt ||
                              "-"}
                          </td>


                          {/* ACTION */}

                          <td
                            className="
                              py-3.5

                              text-center
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                justify-center

                                gap-3
                              "
                            >

                              <button
                                onClick={() =>
                                  downloadReport(
                                    report
                                  )
                                }
                                disabled={
                                  !report.incidentId
                                }
                                className="
                                  inline-flex
                                  items-center

                                  gap-1

                                  text-gray-400

                                  hover:text-emerald-400

                                  transition

                                  text-xs

                                  bg-white/5

                                  hover:bg-emerald-500/10

                                  px-2.5
                                  py-1

                                  rounded

                                  border
                                  border-white/10

                                  whitespace-nowrap

                                  disabled:opacity-40
                                  disabled:cursor-not-allowed
                                "
                                title="Download official archived PDF"
                              >

                                <Download
                                  size={13}
                                />

                                <span>
                                  Download
                                </span>

                              </button>

                            </div>

                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>


            {/* =================================================
                MOBILE TABLE NOTE
            ================================================= */}

            {reportsList.length >
              0 && (

              <div
                className="
                  flex
                  sm:hidden

                  items-center
                  gap-2

                  mt-3

                  px-2

                  text-[10px]

                  text-gray-600
                "
              >

                <span>
                  ← Swipe horizontally to view all archive fields →
                </span>

              </div>

            )}


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {reportsList.length ===
              0 && (

              <div
                className="
                  text-center

                  py-12
                "
              >

                {error ? (

                  <>

                    <AlertCircle
                      size={28}
                      className="
                        text-red-400

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
                      The archive could not be loaded from the server.
                    </p>

                  </>

                ) : (

                  <>

                    <FileCheck
                      size={28}
                      className="
                        text-gray-600

                        mx-auto
                        mb-3
                      "
                    />


                    <p
                      className="
                        text-sm
                        text-gray-500
                      "
                    >
                      No archived reports found in repository.
                    </p>


                    <p
                      className="
                        text-xs
                        text-gray-700

                        mt-1
                      "
                    >
                      No mock or placeholder reports are displayed.
                    </p>

                  </>

                )}

              </div>

            )}

          </div>

        </main>

      </div>

    </div>
  );
}