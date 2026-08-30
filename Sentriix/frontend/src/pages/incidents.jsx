import React, { useState, useEffect } from "react";
import {
  Eye,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { apiService } from "../services/api";


/* =========================================================
   STYLES
========================================================= */

const severityStyle = {
  Critical:
    "bg-red-500/10 text-red-400 border-red-500/30",

  High:
    "bg-orange-500/10 text-orange-400 border-orange-500/30",

  Medium:
    "bg-amber-500/10 text-amber-400 border-amber-500/30",

  Low:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};


const statusStyle = {
  Open:
    "text-emerald-400",

  Investigating:
    "text-blue-400",

  Resolved:
    "text-emerald-400",

  Closed:
    "text-gray-400",
};


/* =========================================================
   NORMALIZE SERVER DATA
========================================================= */

function normalizeIncident(item, index) {
  return {
    id: item?.id
      ? String(item.id).startsWith("INC")
        ? String(item.id)
        : `INC-${String(item.id).padStart(4, "0")}`
      : `INC-${index + 1}`,

    title:
      item?.title ||
      item?.threat_type ||
      item?.incident_type ||
      "Security Incident",

    severity:
      item?.severity ||
      "Low",

    status:
      item?.status ||
      "Open",

    source:
      item?.source ||
      "System",

    time: item?.created_at
      ? new Date(
          item.created_at
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—",

    created_at:
      item?.created_at || null,
  };
}


/* =========================================================
   COMPONENT
========================================================= */

export default function Incidents() {
  const [
    liveIncidents,
    setLiveIncidents,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);


  const [
    search,
    setSearch,
  ] = useState("");

  const [
    severityFilter,
    setSeverityFilter,
  ] = useState("All");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    sourceFilter,
    setSourceFilter,
  ] = useState("All");

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(10);

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);


  /* =======================================================
     FETCH INCIDENTS FROM SERVER ONLY
  ======================================================= */

  useEffect(() => {
    let isMounted = true;


    const fetchIncidents =
      async () => {
        try {
          if (isMounted) {
            setLoading(true);
            setError(null);
          }


          const data =
            await apiService.getIncidents();


          if (!isMounted) {
            return;
          }


          if (Array.isArray(data)) {
            const formatted =
              data.map(
                (
                  item,
                  index
                ) =>
                  normalizeIncident(
                    item,
                    index
                  )
              );

            setLiveIncidents(
              formatted
            );
          } else {
            /*
             * Server returned no valid
             * incident array.
             */
            setLiveIncidents([]);
          }


          setLoading(false);

        } catch (err) {
          console.error(
            "Incidents API Error:",
            err
          );


          if (!isMounted) {
            return;
          }


          /*
           * IMPORTANT:
           * No fallback/mock data.
           */
          setLiveIncidents([]);

          setError(
            err?.message ||
              "Unable to load incidents from the server."
          );

          setLoading(false);
        }
      };


    fetchIncidents();


    /*
     * Refresh from server every 5 seconds
     * so newly uploaded/created incidents
     * appear automatically.
     */
    const interval =
      setInterval(
        fetchIncidents,
        5000
      );


    return () => {
      isMounted = false;
      clearInterval(
        interval
      );
    };
  }, []);


  /* =======================================================
     REAL SERVER DATA ONLY
  ======================================================= */

  const allIncidents =
    liveIncidents;


  /* =======================================================
     SOURCES
  ======================================================= */

  const uniqueSources = [
    "All",
    ...new Set(
      allIncidents.map(
        (incident) =>
          incident.source ||
          "System"
      )
    ),
  ];


  /* =======================================================
     FILTER
  ======================================================= */

  const filtered =
    allIncidents.filter(
      (incident) => {
        const searchValue =
          search
            .trim()
            .toLowerCase();


        const matchesSearch =
          !searchValue ||
          (
            incident.title ||
            ""
          )
            .toLowerCase()
            .includes(
              searchValue
            ) ||
          (
            incident.id ||
            ""
          )
            .toLowerCase()
            .includes(
              searchValue
            );


        const matchesSeverity =
          severityFilter ===
            "All" ||
          incident.severity ===
            severityFilter;


        const matchesStatus =
          statusFilter ===
            "All" ||
          incident.status ===
            statusFilter;


        const matchesSource =
          sourceFilter ===
            "All" ||
          incident.source ===
            sourceFilter;


        return (
          matchesSearch &&
          matchesSeverity &&
          matchesStatus &&
          matchesSource
        );
      }
    );


  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filtered.length /
          rowsPerPage
      )
    );


  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );


  const startIndex =
    (safeCurrentPage - 1) *
    rowsPerPage;


  const paginatedIncidents =
    filtered.slice(
      startIndex,
      startIndex +
        rowsPerPage
    );


  /* =======================================================
     LOADING STATE
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

            <p className="text-sm">
              Loading incidents...
            </p>
          </div>
        </main>
      </div>
    );
  }


  /* =======================================================
     ERROR STATE
  ======================================================= */

  if (error) {
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
              w-full
              max-w-md
              bg-[#0c1220]
              border
              border-red-500/20
              rounded-2xl
              p-6
              text-center
            "
          >
            <AlertCircle
              size={34}
              className="
                text-red-400
                mx-auto
                mb-3
              "
            />

            <h2
              className="
                text-lg
                font-semibold
                mb-2
              "
            >
              Unable to load incidents
            </h2>

            <p
              className="
                text-sm
                text-gray-500
                break-words
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
        bg-[#070b16]
        text-[#eef5f1]
        flex
        flex-col
        lg:flex-row
        overflow-x-hidden
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
        "
      >

        <main
          className="
            flex-1
            overflow-y-auto
            overflow-x-hidden
            p-4
            sm:p-5
            md:p-8
            space-y-5
            md:space-y-6
            pb-8
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
              gap-3
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
                "
              >
                Incidents
              </h1>


              <p
                className="
                  text-gray-400
                  text-sm
                  mt-1
                "
              >
                View all incidents and filter
              </p>

            </div>


            <Link
              to="/new-incident"
              className="
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
                py-2.5
                rounded-lg
                hover:opacity-90
                transition
                text-sm
                w-full
                sm:w-auto
                shrink-0
              "
            >

              <Plus
                size={16}
              />

              New Incident

            </Link>

          </div>


          {/* =================================================
              FILTERS
          ================================================= */}

          <div
            className="
              bg-[#0c1220]
              border
              border-white/10
              rounded-xl
              p-3
              sm:p-4
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-3
            "
          >

            {/* SEARCH */}

            <div
              className="
                flex
                items-center
                gap-2
                bg-[#070b16]
                border
                border-white/10
                rounded-lg
                px-3
                py-2
                min-w-0
                sm:col-span-2
                lg:col-span-1
              "
            >

              <Search
                size={16}
                className="
                  text-gray-500
                  shrink-0
                "
              />

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(
                    e.target.value
                  );

                  setCurrentPage(
                    1
                  );
                }}
                placeholder="Search incidents..."
                className="
                  w-full
                  min-w-0
                  bg-transparent
                  outline-none
                  text-sm
                  placeholder:text-gray-600
                "
              />

            </div>


            {/* SEVERITY */}

            <select
              value={
                severityFilter
              }
              onChange={(e) => {
                setSeverityFilter(
                  e.target.value
                );

                setCurrentPage(
                  1
                );
              }}
              className="
                w-full
                min-w-0
                bg-[#070b16]
                border
                border-white/10
                rounded-lg
                px-3
                py-2
                text-sm
                text-gray-300
                outline-none
              "
            >

              <option value="All">
                Severity: All
              </option>

              {Object.keys(
                severityStyle
              ).map(
                (severity) => (
                  <option
                    key={severity}
                    value={severity}
                  >
                    {severity}
                  </option>
                )
              )}

            </select>


            {/* STATUS */}

            <select
              value={
                statusFilter
              }
              onChange={(e) => {
                setStatusFilter(
                  e.target.value
                );

                setCurrentPage(
                  1
                );
              }}
              className="
                w-full
                min-w-0
                bg-[#070b16]
                border
                border-white/10
                rounded-lg
                px-3
                py-2
                text-sm
                text-gray-300
                outline-none
              "
            >

              <option value="All">
                Status: All
              </option>

              {Object.keys(
                statusStyle
              ).map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}

            </select>


            {/* SOURCE */}

            <select
              value={
                sourceFilter
              }
              onChange={(e) => {
                setSourceFilter(
                  e.target.value
                );

                setCurrentPage(
                  1
                );
              }}
              className="
                w-full
                min-w-0
                bg-[#070b16]
                border
                border-white/10
                rounded-lg
                px-3
                py-2
                text-sm
                text-gray-300
                outline-none
              "
            >

              {uniqueSources.map(
                (source) => (
                  <option
                    key={source}
                    value={source}
                  >
                    {source ===
                    "All"
                      ? "Source: All"
                      : source}
                  </option>
                )
              )}

            </select>

          </div>


          {/* =================================================
              TABLE CARD
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
              min-w-0
            "
          >

            {/* MOBILE TABLE NOTE */}

            <div
              className="
                block
                sm:hidden
                text-[11px]
                text-gray-600
                mb-2
              "
            >
              Swipe left or right to view all incident details.
            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div
              className="
                overflow-x-auto
                -mx-3
                px-3
                sm:-mx-4
                sm:px-4
                md:mx-0
                md:px-0
                pb-2
                max-w-full
              "
            >

              <table
                className="
                  w-full
                  text-sm
                  min-w-[760px]
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
                      Status
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
                        pr-4
                        font-normal
                      "
                    >
                      Time
                    </th>

                    <th
                      className="
                        pb-2
                        font-normal
                        text-right
                      "
                    >
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {paginatedIncidents.map(
                    (incident) => (

                      <tr
                        key={
                          incident.id
                        }
                        className="
                          border-b
                          border-white/5
                          last:border-0
                          hover:bg-white/[0.02]
                          transition
                        "
                      >

                        <td
                          className="
                            py-2.5
                            pr-4
                            text-gray-300
                            font-mono
                            text-xs
                            whitespace-nowrap
                          "
                        >
                          {
                            incident.id
                          }
                        </td>


                        <td
                          className="
                            py-2.5
                            pr-4
                            font-medium
                            max-w-[280px]
                          "
                        >

                          <div
                            className="
                              truncate
                            "
                            title={
                              incident.title
                            }
                          >
                            {
                              incident.title
                            }
                          </div>

                        </td>


                        <td
                          className="
                            py-2.5
                            pr-4
                            whitespace-nowrap
                          "
                        >

                          <span
                            className={`
                              text-xs
                              px-2
                              py-0.5
                              rounded-full
                              border
                              ${
                                severityStyle[
                                  incident
                                    .severity
                                ] ||
                                severityStyle.Low
                              }
                            `}
                          >
                            {
                              incident.severity
                            }
                          </span>

                        </td>


                        <td
                          className={`
                            py-2.5
                            pr-4
                            text-xs
                            font-semibold
                            whitespace-nowrap
                            ${
                              statusStyle[
                                incident.status
                              ] ||
                              "text-gray-400"
                            }
                          `}
                        >
                          {
                            incident.status
                          }
                        </td>


                        <td
                          className="
                            py-2.5
                            pr-4
                            text-gray-400
                            text-xs
                            whitespace-nowrap
                          "
                        >
                          {
                            incident.source
                          }
                        </td>


                        <td
                          className="
                            py-2.5
                            pr-4
                            text-gray-500
                            text-xs
                            whitespace-nowrap
                          "
                        >
                          {
                            incident.time
                          }
                        </td>


                        <td
                          className="
                            py-2.5
                            text-right
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              justify-end
                              gap-4
                            "
                          >

                            {/* VIEW */}

                            <Link
                              to={`/incidents/${incident.id}`}
                              className="
                                inline-flex
                                flex-col
                                items-center
                                gap-0.5
                                text-emerald-400
                                hover:text-emerald-300
                                transition
                              "
                              title="View Incident"
                            >

                              <span
                                className="
                                  text-[10px]
                                "
                              >
                                View
                              </span>

                              <Eye
                                size={16}
                              />

                            </Link>


                            {/* TEAM */}

                            <Link
                              to={`/team-connection?type=incident&id=${incident.id}`}
                              className="
                                inline-flex
                                flex-col
                                items-center
                                gap-0.5
                                text-blue-400
                                hover:text-blue-300
                                transition
                              "
                              title="Send to Team"
                            >

                              <span
                                className="
                                  text-[10px]
                                "
                              >
                                Team
                              </span>

                              <Users
                                size={16}
                              />

                            </Link>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {filtered.length ===
              0 && (

              <div
                className="
                  text-center
                  py-8
                  text-gray-500
                  text-sm
                "
              >
                {allIncidents.length ===
                0
                  ? "No incidents have been received from the server yet."
                  : "No incidents match your search or filter criteria."}
              </div>

            )}


            {/* =================================================
                PAGINATION
            ================================================= */}

            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-3
                mt-4
                pt-4
                border-t
                border-white/10
                text-xs
                text-gray-500
              "
            >

              <span
                className="
                  text-center
                  sm:text-left
                "
              >

                Showing{" "}

                {filtered.length >
                0
                  ? startIndex + 1
                  : 0}

                {" "}to{" "}

                {Math.min(
                  startIndex +
                    rowsPerPage,
                  filtered.length
                )}

                {" "}of{" "}

                {filtered.length}

                {" "}incidents

              </span>


              <div
                className="
                  flex
                  items-center
                  justify-center
                  sm:justify-end
                  flex-wrap
                  gap-2
                "
              >

                <button
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                  disabled={
                    safeCurrentPage ===
                    1
                  }
                  className="
                    p-1
                    hover:text-gray-300
                    disabled:opacity-40
                    disabled:hover:text-gray-500
                  "
                  aria-label="Previous page"
                >

                  <ChevronLeft
                    size={14}
                  />

                </button>


                <span
                  className="
                    w-6
                    h-6
                    flex
                    items-center
                    justify-center
                    rounded
                    bg-emerald-500/10
                    text-emerald-400
                    border
                    border-emerald-500/20
                  "
                >
                  {
                    safeCurrentPage
                  }
                </span>


                <button
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                  className="
                    p-1
                    hover:text-gray-300
                    disabled:opacity-40
                    disabled:hover:text-gray-500
                  "
                  aria-label="Next page"
                >

                  <ChevronRight
                    size={14}
                  />

                </button>


                <span
                  className="
                    ml-1
                    sm:ml-3
                  "
                >
                  Rows per page:
                </span>


                <select
                  value={
                    rowsPerPage
                  }
                  onChange={(e) => {
                    setRowsPerPage(
                      Number(
                        e.target.value
                      )
                    );

                    setCurrentPage(
                      1
                    );
                  }}
                  className="
                    bg-[#070b16]
                    border
                    border-white/10
                    rounded
                    px-2
                    py-1
                    text-gray-300
                    outline-none
                  "
                >

                  <option value={10}>
                    10
                  </option>

                  <option value={25}>
                    25
                  </option>

                  <option value={50}>
                    50
                  </option>

                </select>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}
