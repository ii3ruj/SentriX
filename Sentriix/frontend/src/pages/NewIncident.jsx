import { useState, useRef } from "react";

import {
  ArrowLeft,
  UploadCloud,
  FileText,
  X,
  AlertCircle,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";


/*
|--------------------------------------------------------------------------
| Starting Incident Number
|--------------------------------------------------------------------------
*/

const STARTING_NUMBER = 11;


/*
|--------------------------------------------------------------------------
| Get Stored Incidents
|--------------------------------------------------------------------------
*/

function getStoredIncidents() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "sentrix_incidents"
      ) || "[]"
    );

  } catch {

    return [];

  }

}


/*
|--------------------------------------------------------------------------
| Save Incident
|--------------------------------------------------------------------------
*/

function saveIncident(incident) {

  const stored =
    getStoredIncidents();

  stored.push(incident);

  localStorage.setItem(
    "sentrix_incidents",
    JSON.stringify(stored)
  );

}


/*
|--------------------------------------------------------------------------
| Generate Next Incident ID
|--------------------------------------------------------------------------
*/

function generateNextId() {

  const stored =
    getStoredIncidents();

  const nextNumber =
    STARTING_NUMBER +
    stored.length;

  return `INC-${String(
    nextNumber
  ).padStart(4, "0")}`;

}


/*
|--------------------------------------------------------------------------
| New Incident Page
|--------------------------------------------------------------------------
*/

export default function NewIncident() {

  const navigate = useNavigate();

  const fileInputRef =
    useRef(null);


  /*
  |--------------------------------------------------------------------------
  | Current Analyst
  |--------------------------------------------------------------------------
  */

  const currentAnalyst =
    localStorage.getItem(
      "sentrix_user"
    ) ||
    "analyst@sentrix.com";


  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [
    uploadedFile,
    setUploadedFile,
  ] = useState(null);


  const [
    incidentTime,
    setIncidentTime,
  ] = useState("");


  const [
    notification,
    setNotification,
  ] = useState(null);


  /*
  |--------------------------------------------------------------------------
  | Handle PDF Upload
  |--------------------------------------------------------------------------
  */

  const handleFileChange = (e) => {

    const file =
      e.target.files?.[0];


    if (!file) return;


    if (
      file.type !==
      "application/pdf"
    ) {

      setNotification({
        type: "error",

        message:
          "Only PDF files are supported.",
      });

      return;

    }


    setNotification(null);

    setUploadedFile(file);

  };


  /*
  |--------------------------------------------------------------------------
  | Remove Uploaded File
  |--------------------------------------------------------------------------
  */

  const removeFile = () => {

    setUploadedFile(null);


    if (fileInputRef.current) {

      fileInputRef.current.value =
        "";

    }

  };


  /*
  |--------------------------------------------------------------------------
  | Submit Incident
  |--------------------------------------------------------------------------
  */

  const handleSubmit = (e) => {

    e.preventDefault();

    setNotification(null);


    /*
    --------------------------------------------------------------
    Check PDF
    --------------------------------------------------------------
    */

    if (!uploadedFile) {

      setNotification({
        type: "error",

        message:
          "Please upload an incident report PDF.",
      });

      return;

    }


    /*
    --------------------------------------------------------------
    Check Incident Time
    --------------------------------------------------------------
    */

    if (!incidentTime.trim()) {

      setNotification({
        type: "error",

        message:
          "Please enter the actual incident time.",
      });

      return;

    }


    /*
    --------------------------------------------------------------
    Create Incident
    --------------------------------------------------------------
    */

    const now =
      new Date();


    const newIncident = {

      id:
        generateNextId(),


      /*
      ------------------------------------------------------------
      AI will fill these later
      ------------------------------------------------------------
      */

      title:
        "Pending AI Extraction",

      severity:
        "Pending Analysis",

      status:
        "Open",

      source:
        "Pending AI Extraction",

      incident_type:
        "Pending AI Analysis",

      affected_asset:
        "Pending AI Extraction",


      description:
        "Incident details will be extracted from the uploaded report and analyzed by the SentriX AI engine.",


      network_features:
        null,


      /*
      ------------------------------------------------------------
      Uploaded PDF
      ------------------------------------------------------------
      */

      report_file_name:
        uploadedFile.name,

      report_file_size:
        uploadedFile.size,

      report_type:
        "PDF",


      /*
      ------------------------------------------------------------
      Actual Incident Time
      ------------------------------------------------------------
      */

      actual_incident_time:
        incidentTime,


      /*
      ------------------------------------------------------------
      Submission Time
      ------------------------------------------------------------
      */

      created_at:
        now.toLocaleString(
          "en-US",
          {
            dateStyle: "medium",
            timeStyle: "short",
          }
        ),


      time:
        "Just now",


      /*
      ------------------------------------------------------------
      Created By
      ------------------------------------------------------------
      */

      created_by:
        currentAnalyst,


      /*
      ------------------------------------------------------------
      AI Status
      ------------------------------------------------------------
      */

      ai_status:
        "Pending Analysis",

    };


    /*
    --------------------------------------------------------------
    Save
    --------------------------------------------------------------
    */

    saveIncident(
      newIncident
    );


    console.log(
      "Incident created from PDF:",
      newIncident
    );


    /*
    --------------------------------------------------------------
    Success Message
    --------------------------------------------------------------
    */

    setNotification({

      type: "success",

      message:
        "Report uploaded successfully. AI analysis has started...",

    });


    /*
    --------------------------------------------------------------
    Return to Incidents
    --------------------------------------------------------------
    */

    setTimeout(() => {

      navigate(
        "/incidents"
      );

    }, 1500);

  };


  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (

    <div className="min-h-screen bg-[#070b16] text-[#eef5f1] flex">


      {/* =========================================================
          UNIFIED SIDEBAR
      ========================================================= */}

      <Sidebar />


      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}

      <div className="flex-1 min-w-0">


        <main className="min-h-screen px-8 py-8">


          <div className="max-w-3xl mx-auto">


            {/* ===================================================
                BACK
            =================================================== */}

            <Link
              to="/incidents"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition mb-6"
            >

              <ArrowLeft
                size={16}
              />

              Back to Incidents

            </Link>


            {/* ===================================================
                MAIN CARD
            =================================================== */}

            <div className="bg-[#0c1220] border border-white/10 rounded-2xl p-8 shadow-2xl">


              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="mb-8">

                <h1 className="text-3xl font-bold mb-2">
                  Incident Form
                </h1>


                <p className="text-sm text-gray-400">

                  Upload an incident report for
                  automatic extraction and AI analysis.

                </p>


                <p className="text-xs text-gray-600 mt-2">

                  Logged by:{" "}
                  {currentAnalyst}

                </p>

              </div>


              {/* =================================================
                  NOTIFICATION
              ================================================= */}

              {notification && (

                <div
                  className={`mb-6 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
                    notification.type ===
                    "success"

                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"

                      : "bg-red-500/10 border-red-500/30 text-red-300"
                  }`}
                >

                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />


                  <span>
                    {notification.message}
                  </span>

                </div>

              )}


              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={
                  handleSubmit
                }
                className="space-y-6"
              >


                {/* ===============================================
                    UPLOAD SECTION
                =============================================== */}

                <div>

                  <label className="text-sm font-semibold text-gray-300 mb-3 block">

                    Incident Report

                    <span className="text-red-400 ml-1">
                      *
                    </span>

                  </label>


                  {!uploadedFile ? (

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="w-full min-h-[280px] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 bg-[#070b16] hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] transition group"
                    >

                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/15 transition">

                        <UploadCloud
                          size={30}
                          className="text-emerald-400"
                        />

                      </div>


                      <div className="text-center">

                        <p className="text-base font-semibold text-gray-200 mb-1">

                          Upload Incident Report

                        </p>


                        <p className="text-sm text-gray-500">

                          Click to upload or drag a PDF file here

                        </p>

                      </div>


                      <span className="text-xs text-gray-600">

                        PDF files only

                      </span>

                    </button>

                  ) : (

                    <div className="bg-[#070b16] border border-emerald-500/30 rounded-2xl p-5">

                      <div className="flex items-center justify-between">


                        <div className="flex items-center gap-4">


                          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">

                            <FileText
                              size={24}
                              className="text-emerald-400"
                            />

                          </div>


                          <div>

                            <p className="text-sm font-semibold text-gray-200">

                              {uploadedFile.name}

                            </p>


                            <p className="text-xs text-gray-500 mt-1">

                              {(
                                uploadedFile.size /
                                1024
                              ).toFixed(0)}

                              {" "}KB

                              {" • "}

                              PDF

                            </p>

                          </div>

                        </div>


                        <button
                          type="button"
                          onClick={
                            removeFile
                          }
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
                        >

                          <X
                            size={18}
                          />

                        </button>


                      </div>


                      <div className="mt-5 h-1 rounded-full bg-white/5 overflow-hidden">

                        <div className="h-full w-full bg-emerald-400 rounded-full" />

                      </div>


                      <p className="text-xs text-emerald-400 mt-3">

                        PDF ready for submission

                      </p>

                    </div>

                  )}


                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={
                      handleFileChange
                    }
                    className="hidden"
                  />

                </div>


                {/* ===============================================
                    ACTUAL INCIDENT TIME
                =============================================== */}

                <div>

                  <label className="text-sm font-semibold text-gray-300 mb-2 block">

                    Actual Incident Time

                    <span className="text-red-400 ml-1">
                      *
                    </span>

                  </label>


                  <input
                    type="text"
                    value={
                      incidentTime
                    }
                    onChange={(e) =>
                      setIncidentTime(
                        e.target.value
                      )
                    }
                    placeholder="e.g. 05/26/2026 10:30 AM"
                    className="w-full bg-[#070b16] border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-200 outline-none focus:border-emerald-400/60 transition placeholder:text-gray-600"
                  />


                  <p className="text-xs text-gray-600 mt-2">

                    Enter when the incident actually occurred,
                    not when the report was uploaded.

                  </p>

                </div>


                {/* ===============================================
                    BUTTONS
                =============================================== */}

                <div className="flex gap-3 pt-3">


                  <Link
                    to="/incidents"
                    className="px-6 py-3 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 hover:text-gray-200 transition text-sm flex items-center"
                  >

                    Cancel

                  </Link>


                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-400 to-green-600 text-[#04140b] font-bold py-3 rounded-lg hover:opacity-90 transition text-sm"
                  >

                    Upload &amp; Start AI Analysis

                  </button>

                </div>


              </form>

            </div>


          </div>


        </main>

      </div>

    </div>

  );
}