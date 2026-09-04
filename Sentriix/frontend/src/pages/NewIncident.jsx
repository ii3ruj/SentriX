import { useState, useRef } from "react";
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Download,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { apiService } from "../services/api";

import * as pdfjsLib from "pdfjs-dist";


/*
|--------------------------------------------------------------------------
| PDF.js Worker Setup
|--------------------------------------------------------------------------
*/

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;


/*
|--------------------------------------------------------------------------
| Required 37 Network Flow Features
|--------------------------------------------------------------------------
*/

const REQUIRED_FEATURES = [
  "Protocol",
  "Flow Duration",
  "Total Fwd Packets",
  "Total Backward Packets",
  "Fwd Packets Length Total",
  "Bwd Packets Length Total",
  "Fwd Packet Length Max",
  "Fwd Packet Length Min",
  "Fwd Packet Length Mean",
  "Bwd Packet Length Max",
  "Bwd Packet Length Min",
  "Bwd Packet Length Mean",
  "Flow Bytes/s",
  "Flow Packets/s",
  "Flow IAT Mean",
  "Flow IAT Std",
  "Fwd IAT Total",
  "Bwd IAT Total",
  "Fwd Header Length",
  "Bwd Header Length",
  "Fwd Packets/s",
  "Bwd Packets/s",
  "Packet Length Min",
  "Packet Length Max",
  "Packet Length Mean",
  "Packet Length Std",
  "Packet Length Variance",
  "FIN Flag Count",
  "SYN Flag Count",
  "RST Flag Count",
  "PSH Flag Count",
  "ACK Flag Count",
  "URG Flag Count",
  "ECE Flag Count",
  "Down/Up Ratio",
  "Avg Packet Size",
  "Fwd Seg Size Min",
];


/*
|--------------------------------------------------------------------------
| Current Analyst
|--------------------------------------------------------------------------
*/

function getCurrentAnalyst() {
  try {
    const storedUser =
      localStorage.getItem(
        "sentrix_user"
      );

    if (!storedUser) {
      return "analyst@sentrix.com";
    }

    try {
      const parsed =
        JSON.parse(storedUser);

      return (
        parsed?.email ||
        parsed?.username ||
        parsed?.name ||
        storedUser
      );
    } catch {
      return storedUser;
    }
  } catch {
    return "analyst@sentrix.com";
  }
}


/*
|--------------------------------------------------------------------------
| Normalize PDF Text
|--------------------------------------------------------------------------
*/

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\u00a0/g, " ")
    .replace(/[–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}


/*
|--------------------------------------------------------------------------
| Compact Text
|--------------------------------------------------------------------------
*/

function compactText(text) {
  return normalizeText(text).replace(
    /[^a-z0-9]/g,
    ""
  );
}


/*
|--------------------------------------------------------------------------
| Extract PDF Text
|--------------------------------------------------------------------------
*/

async function extractPDFText(file) {
  const arrayBuffer =
    await file.arrayBuffer();

  const pdf =
    await pdfjsLib.getDocument({
      data: arrayBuffer,
    }).promise;

  let fullText = "";

  for (
    let pageNumber = 1;
    pageNumber <= pdf.numPages;
    pageNumber++
  ) {
    const page =
      await pdf.getPage(
        pageNumber
      );

    const textContent =
      await page.getTextContent();

    const pageText =
      textContent.items
        .map(
          (item) =>
            item.str || ""
        )
        .join(" ");

    fullText +=
      " " + pageText;
  }

  return normalizeText(
    fullText
  );
}


/*
|--------------------------------------------------------------------------
| Check Feature
|--------------------------------------------------------------------------
*/

function containsFeature(
  text,
  feature
) {
  const normalizedPDF =
    compactText(text);

  const normalizedFeature =
    compactText(feature);

  return normalizedPDF.includes(
    normalizedFeature
  );
}


/*
|--------------------------------------------------------------------------
| Validate SentriX PDF
|--------------------------------------------------------------------------
*/

async function validateIncidentPDF(
  file
) {
  const fileName =
    (
      file.name || ""
    ).toLowerCase();

  const isPDF =
    file.type ===
      "application/pdf" ||
    fileName.endsWith(
      ".pdf"
    );

  if (!isPDF) {
    return {
      valid: false,
      reason:
        "Invalid file format. Only PDF files are accepted.",
      missingFeatures: [],
    };
  }

  let pdfText = "";

  try {
    pdfText =
      await extractPDFText(
        file
      );
  } catch (error) {
    console.error(
      "PDF extraction error:",
      error
    );

    return {
      valid: false,
      reason:
        "The PDF could not be read. Please upload a valid SentriX Incident Report PDF.",
      missingFeatures: [],
    };
  }

  if (
    !pdfText ||
    pdfText.length < 20
  ) {
    return {
      valid: false,
      reason:
        "The PDF does not contain readable text. Please upload the completed SentriX PDF report.",
      missingFeatures: [],
    };
  }

  const missingFeatures =
    REQUIRED_FEATURES.filter(
      (feature) =>
        !containsFeature(
          pdfText,
          feature
        )
    );

  if (
    missingFeatures.length > 0
  ) {
    const preview =
      missingFeatures
        .slice(0, 7)
        .join(", ");

    const more =
      missingFeatures.length >
      7
        ? " ..."
        : "";

    return {
      valid: false,
      reason:
        `Invalid Incident Report. ${missingFeatures.length} of the 37 required network-flow features are missing from the uploaded PDF. Missing: ${preview}${more}`,
      missingFeatures,
    };
  }

  const hasSentriX =
    pdfText.includes(
      "sentrix"
    );

  const hasIncidentReport =
    pdfText.includes(
      "incident report"
    );

  const hasAISection =
    pdfText.includes(
      "ai network features"
    );

  if (
    !hasSentriX ||
    !hasIncidentReport ||
    !hasAISection
  ) {
    return {
      valid: false,
      reason:
        "The PDF contains the required 37 network-flow features, but it is not a valid SentriX Incident Report template.",
      missingFeatures: [],
    };
  }

  return {
    valid: true,
    reason:
      "Valid SentriX Incident Report. All 37 required network-flow features were detected.",
    missingFeatures: [],
  };
}


/*
|--------------------------------------------------------------------------
| New Incident Page Component
|--------------------------------------------------------------------------
*/

export default function NewIncident() {
  const navigate =
    useNavigate();

  const fileInputRef =
    useRef(null);

  const currentAnalyst =
    getCurrentAnalyst();

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

  const [
    isValidating,
    setIsValidating,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | Handle Template Download
  |--------------------------------------------------------------------------
  */

  const handleDownloadTemplate = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>SentriX Incident Report Template</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.5; margin: 20px; }
          h1 { color: #0b192c; font-size: 20px; border-bottom: 2px solid #89CFF0; padding-bottom: 8px; }
          h2 { color: #468cbe; font-size: 14px; margin-top: 20px; border-left: 4px solid #89CFF0; padding-left: 8px; }
          p { font-size: 11px; color: #555; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; }
          th, td { border: 1px solid #bce0fd; padding: 8px 12px; font-size: 10.5px; text-align: left; }
          th { background-color: #89CFF0; color: #0a283c; font-weight: bold; }
          tr:nth-child(even) { background-color: #ebf6fc; }
          .footer { font-size: 9px; color: #787878; margin-top: 30px; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; }
        </style>
      </head>
      <body>
        <h1>SentriX — Incident Report Template</h1>
        <p>Fill in the values below and upload this file on the New Incident page. Keep the field names exactly as they appear — the analysis engine matches them by name. The AI Network Features section is required for machine-learning scoring.</p>

        <h2>1. Incident Information</h2>
        <table>
          <tr><th width="30%">Field</th><th width="70%">Value</th></tr>
          <tr><td>Incident Type</td><td></td></tr>
          <tr><td>Source</td><td></td></tr>
          <tr><td>Description</td><td></td></tr>
        </table>

        <h2>2. Network Information</h2>
        <table>
          <tr><th width="30%">Field</th><th width="70%">Value</th></tr>
          <tr><td>Protocol</td><td></td></tr>
          <tr><td>Source IP</td><td></td></tr>
          <tr><td>Destination IP</td><td></td></tr>
        </table>

        <h2>3. Asset Information</h2>
        <table>
          <tr><th width="30%">Field</th><th width="70%">Value</th></tr>
          <tr><td>Asset Type</td><td></td></tr>
          <tr><td>Asset Criticality</td><td></td></tr>
          <tr><td>Exposure</td><td></td></tr>
          <tr><td>Vulnerability</td><td></td></tr>
          <tr><td>Business Impact</td><td></td></tr>
        </table>

        <h2>4. AI Network Features — All 37 values required</h2>
        <p>Values are standardized (StandardScaler) exactly as the model was trained.</p>
        <table>
          <tr><th width="60%">Feature</th><th width="40%">Value</th></tr>
          ${REQUIRED_FEATURES.map((f) => `<tr><td><b>${f}</b></td><td></td></tr>`).join("")}
        </table>

        <div class="footer">
          SentriX — AI-Powered Threat Investigation & Incident Response Platform. Do not rename or reorder the fields.
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "SentriX_Incident_Template.doc";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  /*
  |--------------------------------------------------------------------------
  | Handle File Upload
  |--------------------------------------------------------------------------
  */

  const handleFileChange =
    async (e) => {
      const file =
        e.target.files?.[0];

      if (!file) {
        return;
      }

      setUploadedFile(null);
      setNotification(null);

      const fileName =
        (
          file.name || ""
        ).toLowerCase();

      const isPDF =
        file.type ===
          "application/pdf" ||
        fileName.endsWith(
          ".pdf"
        );

      if (!isPDF) {
        if (
          fileInputRef.current
        ) {
          fileInputRef.current.value =
            "";
        }

        setNotification({
          type: "error",
          message:
            "Invalid file format. Only PDF files are accepted.",
        });

        return;
      }

      setIsValidating(
        true
      );

      try {
        const validation =
          await validateIncidentPDF(
            file
          );

        if (
          !validation.valid
        ) {
          if (
            fileInputRef.current
          ) {
            fileInputRef.current.value =
              "";
          }

          setUploadedFile(
            null
          );

          setNotification({
            type: "error",
            message:
              validation.reason,
          });

          return;
        }

        setUploadedFile(
          file
        );

        setNotification({
          type: "success",
          message:
            "Valid SentriX Incident Report. All 37 required features were detected.",
        });

      } catch (error) {
        console.error(
          "Validation error:",
          error
        );

        if (
          fileInputRef.current
        ) {
          fileInputRef.current.value =
            "";
        }

        setUploadedFile(
          null
        );

        setNotification({
          type: "error",
          message:
            "Could not validate this PDF. Please upload the official SentriX Incident Report PDF.",
        });
      } finally {
        setIsValidating(
          false
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | Remove File
  |--------------------------------------------------------------------------
  */

  const removeFile = () => {
    setUploadedFile(
      null
    );

    setNotification(
      null
    );

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Submit Incident
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setNotification(
        null
      );

      if (!uploadedFile) {
        setNotification({
          type: "error",
          message:
            "Please upload a valid SentriX Incident Report PDF.",
        });

        return;
      }

      if (
        !incidentTime.trim()
      ) {
        setNotification({
          type: "error",
          message:
            "Please enter the actual incident time.",
        });

        return;
      }

      if (isSubmitting) {
        return;
      }

      setIsSubmitting(
        true
      );

      try {
        const formData =
          new FormData();

        formData.append(
          "file",
          uploadedFile
        );

        formData.append(
          "actual_time",
          incidentTime.trim()
        );

        formData.append(
          "analyst",
          currentAnalyst
        );

        const response =
          await apiService.uploadIncidentPDF(
            formData
          );

        console.log(
          "Incident uploaded successfully:",
          response
        );

        setNotification({
          type: "success",
          message:
            "Report uploaded successfully. AI analysis has started.",
        });

        setTimeout(() => {
          navigate(
            `/ai-analysis/${response?.id || response?.incident_id}`
          );
        }, 1200);

      } catch (error) {
        console.error(
          "Incident upload error:",
          error
        );

        setNotification({
          type: "error",
          message:
            error?.message ||
            "Failed to upload the incident report to the server.",
        });

      } finally {
        setIsSubmitting(
          false
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

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
        "
      >

        <main
          className="
            min-h-screen
            px-4
            sm:px-5
            md:px-8
            py-5
            sm:py-6
            md:py-8
          "
        >

          <div
            className="
              max-w-3xl
              mx-auto
              w-full
            "
          >

            {/* BACK */}
            <Link
              to="/incidents"
              className="
                inline-flex
                items-center
                gap-2
                text-sm
                text-gray-400
                hover:text-emerald-400
                transition
                mb-5
                sm:mb-6
              "
            >
              <ArrowLeft
                size={16}
              />
              Back to Incidents
            </Link>

            {/* MAIN CARD */}
            <div
              className="
                bg-[#0c1220]
                border
                border-white/10
                rounded-2xl
                p-4
                sm:p-6
                md:p-8
                shadow-2xl
              "
            >

              {/* HEADER */}
              <div
                className="
                  mb-6
                  sm:mb-8
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-4
                "
              >
                <div>
                  <h1
                    className="
                      text-2xl
                      sm:text-3xl
                      font-bold
                      mb-2
                    "
                  >
                    Incident Intake Form
                  </h1>

                  <p
                    className="
                      text-sm
                      text-gray-400
                      leading-relaxed
                    "
                  >
                    Upload an authorized incident report PDF for format verification, automated extraction, and AI analysis.
                  </p>

                  <p
                    className="
                      text-xs
                      text-gray-600
                      mt-2
                      break-all
                    "
                  >
                    Logged by:{" "}
                    {currentAnalyst}
                  </p>
                </div>

                {/* TEMPLATE DOWNLOAD BUTTON */}
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    bg-white/5
                    border
                    border-white/10
                    hover:border-emerald-500/40
                    hover:bg-emerald-500/10
                    text-gray-200
                    hover:text-emerald-300
                    text-xs
                    font-semibold
                    px-4
                    py-2.5
                    rounded-xl
                    transition
                    shrink-0
                    w-fit
                  "
                >
                  <Download size={15} className="text-emerald-400" />
                  Download Report Template
                </button>

              </div>

              {/* NOTIFICATION */}
              {notification && (
                <div
                  className={`
                    mb-6
                    flex
                    items-start
                    gap-3
                    rounded-lg
                    border
                    px-4
                    py-3
                    text-sm
                    ${
                      notification.type ===
                      "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-red-500/10 border-red-500/30 text-red-300"
                    }
                  `}
                >
                  {notification.type ===
                  "success" ? (
                    <CheckCircle2
                      size={19}
                      className="
                        mt-0.5
                        shrink-0
                      "
                    />
                  ) : (
                    <ShieldAlert
                      size={19}
                      className="
                        mt-0.5
                        shrink-0
                      "
                    />
                  )}

                  <span>
                    {
                      notification.message
                    }
                  </span>
                </div>
              )}

              {/* FORM */}
              <form
                onSubmit={
                  handleSubmit
                }
                className="
                  space-y-6
                "
              >

                {/* UPLOAD */}
                <div>
                  <label
                    className="
                      text-sm
                      font-semibold
                      text-gray-300
                      mb-3
                      block
                    "
                  >
                    Incident Report
                    <span
                      className="
                        text-red-400
                        ml-1
                      "
                    >
                      *
                    </span>
                  </label>

                  {!uploadedFile ? (
                    <button
                      type="button"
                      disabled={
                        isValidating ||
                        isSubmitting
                      }
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="
                        w-full
                        min-h-[240px]
                        sm:min-h-[280px]
                        border-2
                        border-dashed
                        border-white/10
                        rounded-2xl
                        flex
                        flex-col
                        items-center
                        justify-center
                        gap-4
                        bg-[#070b16]
                        hover:border-emerald-500/40
                        hover:bg-emerald-500/[0.02]
                        transition
                        group
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                        px-4
                      "
                    >
                      <div
                        className="
                          w-14
                          h-14
                          sm:w-16
                          sm:h-16
                          rounded-full
                          bg-emerald-500/10
                          border
                          border-emerald-500/20
                          flex
                          items-center
                          justify-center
                        "
                      >
                        {isValidating ? (
                          <Loader2
                            size={30}
                            className="
                              text-emerald-400
                              animate-spin
                            "
                          />
                        ) : (
                          <UploadCloud
                            size={30}
                            className="
                              text-emerald-400
                            "
                          />
                        )}
                      </div>

                      <div
                        className="
                          text-center
                        "
                      >
                        <p
                          className="
                            text-base
                            font-semibold
                            text-gray-200
                            mb-1
                          "
                        >
                          {isValidating
                            ? "Validating PDF..."
                            : "Upload Incident Report"}
                        </p>

                        <p
                          className="
                            text-sm
                            text-gray-500
                          "
                        >
                          {isValidating
                            ? "Checking the required 37 network-flow features"
                            : "Click to upload a PDF file"}
                        </p>
                      </div>

                      <span
                        className="
                          text-xs
                          text-gray-600
                        "
                      >
                        PDF files only
                      </span>
                    </button>
                  ) : (
                    <div
                      className="
                        bg-[#070b16]
                        border
                        border-emerald-500/30
                        rounded-2xl
                        p-4
                        sm:p-5
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-3
                            sm:gap-4
                            min-w-0
                          "
                        >
                          <div
                            className="
                              w-11
                              h-11
                              sm:w-12
                              sm:h-12
                              rounded-lg
                              bg-emerald-500/10
                              flex
                              items-center
                              justify-center
                              shrink-0
                            "
                          >
                            <FileText
                              size={24}
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
                            <div
                              className="
                                flex
                                items-center
                                gap-2
                                flex-wrap
                              "
                            >
                              <p
                                className="
                                  text-sm
                                  font-semibold
                                  text-gray-200
                                  break-all
                                "
                              >
                                {
                                  uploadedFile.name
                                }
                              </p>

                              <span
                                className="
                                  text-[10px]
                                  bg-emerald-500/20
                                  text-emerald-300
                                  px-2
                                  py-0.5
                                  rounded-md
                                  whitespace-nowrap
                                "
                              >
                                37/37 Validated
                              </span>
                            </div>

                            <p
                              className="
                                text-xs
                                text-gray-500
                                mt-1
                              "
                            >
                              {(
                                uploadedFile.size /
                                1024
                              ).toFixed(
                                0
                              )}
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
                          disabled={
                            isSubmitting
                          }
                          className="
                            w-9
                            h-9
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            text-gray-500
                            hover:text-red-400
                            hover:bg-red-500/10
                            transition
                            shrink-0
                            disabled:opacity-50
                          "
                        >
                          <X
                            size={18}
                          />
                        </button>
                      </div>

                      <div
                        className="
                          mt-5
                          h-1
                          rounded-full
                          bg-white/5
                          overflow-hidden
                        "
                      >
                        <div
                          className="
                            h-full
                            w-full
                            bg-emerald-400
                            rounded-full
                          "
                        />
                      </div>

                      <p
                        className="
                          text-xs
                          text-emerald-400
                          mt-3
                          flex
                          items-center
                          gap-2
                        "
                      >
                        <CheckCircle2
                          size={14}
                        />
                        All 37 required features detected.
                      </p>
                    </div>
                  )}

                  <input
                    ref={
                      fileInputRef
                    }
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={
                      handleFileChange
                    }
                    className="hidden"
                  />
                </div>

                {/* ACTUAL INCIDENT TIME */}
                <div>
                  <label
                    className="
                      text-sm
                      font-semibold
                      text-gray-300
                      mb-2
                      block
                    "
                  >
                    Actual Incident Time
                    <span
                      className="
                        text-red-400
                        ml-1
                      "
                    >
                      *
                    </span>
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      incidentTime
                    }
                    onChange={(e) =>
                      setIncidentTime(
                        e.target.value
                      )
                    }
                    max={
                      new Date()
                        .toISOString()
                        .slice(0, 16)
                    }
                    disabled={
                      isSubmitting
                    }
                    className="
                      w-full
                      bg-[#070b16]
                      border
                      border-white/10
                      rounded-lg
                      px-4
                      py-3
                      text-sm
                      text-gray-200
                      outline-none
                      focus:border-emerald-400/60
                      transition
                      placeholder:text-gray-600
                      disabled:opacity-50
                    "
                  />

                  <p
                    className="
                      text-xs
                      text-gray-600
                      mt-2
                    "
                  >
                    Enter when the incident actually occurred, not when the report was uploaded.
                  </p>
                </div>

                {/* BUTTONS */}
                <div
                  className="
                    flex
                    flex-col-reverse
                    sm:flex-row
                    gap-3
                    pt-3
                  "
                >
                  <Link
                    to="/incidents"
                    className={`
                      px-6
                      py-3
                      rounded-lg
                      border
                      border-white/10
                      text-gray-400
                      hover:bg-white/5
                      hover:text-gray-200
                      transition
                      text-sm
                      flex
                      items-center
                      justify-center
                      ${
                        isSubmitting
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    `}
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      isValidating ||
                      !uploadedFile
                    }
                    className="
                      flex-1
                      bg-gradient-to-r
                      from-emerald-400
                      to-green-600
                      text-[#04140b]
                      font-bold
                      py-3
                      rounded-lg
                      hover:opacity-90
                      transition
                      text-sm
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    {isSubmitting
                      ? "Uploading & Starting AI Analysis..."
                      : "Upload & Start AI Analysis"}
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
