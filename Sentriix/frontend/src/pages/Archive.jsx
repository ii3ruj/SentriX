import { useState } from "react";

import {
  Download,
} from "lucide-react";

import Sidebar from "../components/Sidebar";


/*
|--------------------------------------------------------------------------
| Temporary CRSI Summary
|--------------------------------------------------------------------------
*/

const MOCK_CRSI_SUMMARY = {
  overallScore: "6.8 / 10",
  maturityLevel: "Moderate",
  people: "7.0 / 10",
  process: "6.5 / 10",
  technology: "7.0 / 10",
};


/*
|--------------------------------------------------------------------------
| Temporary Archived Reports
|--------------------------------------------------------------------------
*/

const MOCK_REPORTS = [

  {
    id: "RPT-0001",
    incidentId: "INC-0001",
    title: "Incident Report - INC-0001",
    type: "Incident Report",
    archivedAt: "2026-05-26 13:45",

    content: {
      incidentTitle:
        "Ransomware detected on Server-01",

      severity: "Critical",

      riskScore: "87 / 100",

      source: "EDR (CrowdStrike)",

      asset:
        "Server-01 (Critical criticality)",

      threatType: "Ransomware",

      keyFindings: [
        "Suspicious encryption activity detected on Server-01.",
        "Multiple files have been encrypted.",
        "Ransom note detected in affected directories.",
      ],

      playbook:
        "RANSOMWARE_RESPONSE_PLAYBOOK",

      recommendedActions: [
        "Isolate affected host: Server-01",
        "Block malicious IP",
        "Terminate malicious processes",
        "Collect and preserve logs",
        "Run antivirus full scan",
      ],
    },
  },


  {
    id: "RPT-0002",
    incidentId: "INC-0002",
    title: "Incident Report - INC-0002",
    type: "Incident Report",
    archivedAt: "2026-05-26 09:30",

    content: {
      incidentTitle:
        "Unusual login from foreign location",

      severity: "Medium",

      riskScore: "52 / 100",

      source: "SIEM",

      asset:
        "Workstation (Medium criticality)",

      threatType: "Brute Force",

      keyFindings: [
        "Multiple failed login attempts from an unrecognized IP address.",
        "Login attempt originated from an unusual geographic location.",
      ],

      playbook:
        "BRUTE_FORCE_RESPONSE_PLAYBOOK",

      recommendedActions: [
        "Lock affected account",
        "Block source IP",
        "Force password reset",
        "Enable MFA",
      ],
    },
  },


  /*
  |--------------------------------------------------------------------------
  | Existing CRSI Report
  |--------------------------------------------------------------------------
  */

  {
    id: "RPT-0003",
    incidentId: null,
    title: "CRSI Report - Organizational Assessment",
    type: "CRSI Report",
    archivedAt: "2026-05-25 18:00",
    isCrsi: true,
  },


  {
    id: "RPT-0005",
    incidentId: "INC-0003",
    title: "Incident Report - INC-0003",
    type: "Incident Report",
    archivedAt: "2026-05-24 14:10",

    content: {
      incidentTitle:
        "Multiple failed login attempts",

      severity: "Medium",

      riskScore: "52 / 100",

      source: "AD",

      asset:
        "Workstation (Medium criticality)",

      threatType: "Brute Force",

      keyFindings: [
        "Repeated failed authentication attempts detected against a domain account.",
      ],

      playbook:
        "BRUTE_FORCE_RESPONSE_PLAYBOOK",

      recommendedActions: [
        "Lock affected account",
        "Force password reset",
        "Review authentication logs",
      ],
    },
  },

];


/*
|--------------------------------------------------------------------------
| Generated Reports from CRSI Recommendations
|--------------------------------------------------------------------------
*/

function getGeneratedReports() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "sentrix_archived_reports"
      ) || "[]"
    );

  } catch {

    return [];

  }

}


/*
|--------------------------------------------------------------------------
| Download Archived Report
|--------------------------------------------------------------------------
*/

function downloadReport(report) {

  let lines;


  /*
  |--------------------------------------------------------------------------
  | CRSI REPORT
  |--------------------------------------------------------------------------
  */

  if (report.isCrsi) {

    const s =
      report.content?.overallScore
        ? {
            overallScore:
              report.content.overallScore,

            maturityLevel:
              report.content.maturityLevel,

            people:
              report.content.people || "N/A",

            process:
              report.content.process || "N/A",

            technology:
              report.content.technology || "N/A",
          }
        : MOCK_CRSI_SUMMARY;


    lines = [

      `SentriX Archived Report`,

      `========================`,

      `Report ID: ${report.id}`,

      `Type: CRSI Assessment Report`,

      `Archived At: ${report.archivedAt}`,

      ``,

      `--- Organizational CRSI Score ---`,

      `Overall CRSI Score: ${s.overallScore}`,

      `Maturity Level: ${s.maturityLevel}`,

      ``,

      `--- Breakdown by Dimension ---`,

      `People: ${s.people}`,

      `Process: ${s.process}`,

      `Technology: ${s.technology}`,

      ``,

      `Note: This score reflects the organization's overall cyber resilience posture`,

      `and is independent of any single incident.`,

    ];

  }


  /*
  |--------------------------------------------------------------------------
  | INCIDENT REPORT
  |--------------------------------------------------------------------------
  */

  else {

    const c =
      report.content || {};

    const s =
      MOCK_CRSI_SUMMARY;


    lines = [

      `SentriX Archived Report`,

      `========================`,

      `Report ID: ${report.id}`,

      `Related Incident: ${report.incidentId || "N/A"}`,

      `Type: Incident Report`,

      `Archived At: ${report.archivedAt}`,

      ``,

      `--- Incident Information ---`,

      `Title: ${c.incidentTitle || "N/A"}`,

      `Severity: ${c.severity || "N/A"}`,

      `Risk Score: ${c.riskScore || "N/A"}`,

      `Source: ${c.source || "N/A"}`,

      `Asset: ${c.asset || "N/A"}`,

      `Threat Type: ${c.threatType || "N/A"}`,

      ``,

      `--- AI Analysis: Key Findings ---`,

      ...(c.keyFindings || []).map(
        (f) => `- ${f}`
      ),

      ``,

      `--- Recommendations ---`,

      `Playbook: ${c.playbook || "N/A"}`,

      ...(c.recommendedActions || []).map(
        (a, i) =>
          `${i + 1}. ${a}`
      ),

      ``,

      `--- Organizational CRSI Security Score (at time of archiving) ---`,

      `Overall CRSI Score: ${s.overallScore}`,

      `Maturity Level: ${s.maturityLevel}`,

      `People: ${s.people} | Process: ${s.process} | Technology: ${s.technology}`,

    ];

  }


  /*
  |--------------------------------------------------------------------------
  | Create Download File
  |--------------------------------------------------------------------------
  */

  const blob = new Blob(
    [
      lines.join("\n"),
    ],
    {
      type: "text/plain",
    }
  );


  const url =
    URL.createObjectURL(blob);


  const a =
    document.createElement("a");


  a.href =
    url;


  a.download =
    `${report.id}.txt`;


  document.body.appendChild(a);


  a.click();


  document.body.removeChild(a);


  URL.revokeObjectURL(url);

}


/*
|--------------------------------------------------------------------------
| Archive Page
|--------------------------------------------------------------------------
*/

export default function Archive() {

  /*
  |--------------------------------------------------------------------------
  | Reports generated from CRSI
  |--------------------------------------------------------------------------
  */

  const [
    generatedReports,
  ] = useState(
    getGeneratedReports
  );


  /*
  |--------------------------------------------------------------------------
  | Combine Generated + Existing Reports
  |--------------------------------------------------------------------------
  */

  const allReports = [

    ...generatedReports,

    ...MOCK_REPORTS,

  ];


  return (

    <div className="min-h-screen bg-[#070b16] text-[#eef5f1] flex">


      {/* =========================================================
          UNIFIED SIDEBAR
      ========================================================= */}

      <Sidebar />


      {/* =========================================================
          MAIN AREA
      ========================================================= */}

      <div className="flex-1 flex flex-col">


        {/* =======================================================
            HEADER
        ======================================================= */}

        <header className="flex items-center justify-end px-8 py-4 border-b border-white/10">

          <div className="text-xs text-gray-500">

            Archived Reports

          </div>

        </header>


        {/* =======================================================
            CONTENT
        ======================================================= */}

        <main className="flex-1 overflow-y-auto p-8 space-y-6">


          {/* PAGE TITLE */}

          <div>

            <h1 className="text-2xl font-bold">

              Archive

            </h1>


            <p className="text-gray-400 text-sm">

              View and manage archived reports

            </p>

          </div>


          {/* =====================================================
              ARCHIVE TABLE
          ===================================================== */}

          <div className="bg-[#0c1220] border border-white/10 rounded-xl p-5 overflow-x-auto">

            <table className="w-full text-sm">


              {/* =================================================
                  TABLE HEADER
              ================================================= */}

              <thead>

                <tr className="text-left text-gray-500 text-xs border-b border-white/10">


                  <th className="pb-3 font-normal">

                    Report ID

                  </th>


                  <th className="pb-3 font-normal">

                    Title

                  </th>


                  <th className="pb-3 font-normal">

                    Type

                  </th>


                  <th className="pb-3 font-normal">

                    Archive Generated

                  </th>


                  <th className="pb-3 font-normal text-center">

                    Actions

                  </th>


                </tr>

              </thead>


              {/* =================================================
                  TABLE BODY
              ================================================= */}

              <tbody>

                {allReports.map(

                  (report) => (

                    <tr
                      key={report.id}
                      className="border-b border-white/5 last:border-0"
                    >


                      {/* REPORT ID */}

                      <td className="py-3.5 text-gray-300 font-medium">

                        {report.id}

                      </td>


                      {/* TITLE */}

                      <td className="py-3.5">

                        {report.title}

                      </td>


                      {/* TYPE */}

                      <td className="py-3.5">

                        <span
                          className={
                            report.type ===
                            "CRSI Report"

                              ? "text-emerald-400"

                              : "text-gray-400"
                          }
                        >

                          {report.type}

                        </span>

                      </td>


                      {/* DATE */}

                      <td className="py-3.5 text-gray-500">

                        {report.archivedAt}

                      </td>


                      {/* DOWNLOAD */}

                      <td className="py-3.5 text-center">

                        <button
                          onClick={() =>
                            downloadReport(
                              report
                            )
                          }
                          className="inline-flex text-gray-400 hover:text-emerald-400 transition"
                          title="Download report"
                        >

                          <Download
                            size={16}
                          />

                        </button>

                      </td>


                    </tr>

                  )

                )}

              </tbody>

            </table>


            {/* EMPTY STATE */}

            {allReports.length === 0 && (

              <div className="text-center py-10">

                <p className="text-sm text-gray-500">

                  No archived reports found.

                </p>

              </div>

            )}

          </div>


        </main>

      </div>

    </div>

  );

}