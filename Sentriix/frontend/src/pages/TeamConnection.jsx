import { useState } from "react";

import {
  useSearchParams,
  Link,
} from "react-router-dom";

import {
  Send,
  ShieldAlert,
  BarChart3,
  CheckCircle2,
  Inbox as InboxIcon,
} from "lucide-react";

import Sidebar from "../components/Sidebar";


/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

const CURRENT_USER_ID =
  "analyst1";

const CURRENT_USER_NAME =
  "Analyst One";


/*
|--------------------------------------------------------------------------
| Mock Incidents
|--------------------------------------------------------------------------
*/

const MOCK_INCIDENTS = [

  {
    id: "INC-0001",
    title:
      "Ransomware detected on Server-01",
    severity:
      "Critical",
  },

  {
    id: "INC-0002",
    title:
      "Unusual login from foreign location",
    severity:
      "High",
  },

  {
    id: "INC-0003",
    title:
      "Multiple failed login attempts",
    severity:
      "Medium",
  },

  {
    id: "INC-0004",
    title:
      "Data exfiltration attempt blocked",
    severity:
      "High",
  },

  {
    id: "INC-0005",
    title:
      "Brute force attack detected",
    severity:
      "High",
  },

  {
    id: "INC-0006",
    title:
      "Suspicious file execution",
    severity:
      "Low",
  },

  {
    id: "INC-0007",
    title:
      "Phishing email detected",
    severity:
      "Medium",
  },

  {
    id: "INC-0008",
    title:
      "Privilege escalation attempt",
    severity:
      "High",
  },

  {
    id: "INC-0009",
    title:
      "Malware communication blocked",
    severity:
      "Critical",
  },

  {
    id: "INC-0010",
    title:
      "Unauthorized access to database",
    severity:
      "Critical",
  },

];


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
| CRSI Summary
|--------------------------------------------------------------------------
*/

const MOCK_CRSI_SUMMARY = {

  overallScore:
    "6.8 / 10",

  maturityLevel:
    "Moderate",

};


/*
|--------------------------------------------------------------------------
| Team Members
|--------------------------------------------------------------------------
*/

const TEAM_MEMBERS = [

  {
    id: "analyst1",
    name: "Analyst One",
    role: "SOC Analyst",
  },

  {
    id: "analyst2",
    name: "Analyst Two",
    role: "SOC Analyst",
  },

  {
    id: "lead",
    name: "Sara Al-Otaibi",
    role: "SOC Team Lead",
  },

  {
    id: "manager",
    name: "Omar Al-Harbi",
    role: "Security Manager",
  },

];


/*
|--------------------------------------------------------------------------
| Mock Incoming Messages
|--------------------------------------------------------------------------
*/

const MOCK_INCOMING_MESSAGES = [

  {

    id:
      "MSG-SEED-001",

    senderId:
      "manager",

    senderName:
      "Omar Al-Harbi",

    senderRole:
      "Security Manager",

    recipientId:
      "analyst1",

    itemLabel:
      "INC-0001",

    itemDetail:
      "Ransomware detected on Server-01",

    message:
      "Please confirm this incident has been fully contained and share an update by end of day.",

    sentAt:
      "2026-08-13 09:15 AM",

  },


  {

    id:
      "MSG-SEED-002",

    senderId:
      "lead",

    senderName:
      "Sara Al-Otaibi",

    senderRole:
      "SOC Team Lead",

    recipientId:
      "analyst1",

    itemLabel:
      "CRSI Security Score Report",

    itemDetail:
      "6.8 / 10 — Moderate",

    message:
      "Review the Process category answers before we present this to management next week.",

    sentAt:
      "2026-08-12 04:40 PM",

  },


  {

    id:
      "MSG-SEED-003",

    senderId:
      "manager",

    senderName:
      "Omar Al-Harbi",

    senderRole:
      "Security Manager",

    recipientId:
      "analyst1",

    itemLabel:
      "INC-0005",

    itemDetail:
      "Brute force attack detected",

    message:
      "Escalate to the network team if the source IP hits the firewall again.",

    sentAt:
      "2026-08-11 11:02 AM",

  },

];


/*
|--------------------------------------------------------------------------
| Get Sent History
|--------------------------------------------------------------------------
*/

function getStoredHistory() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "sentrix_team_sends"
      ) || "[]"
    );

  } catch {

    return [];

  }

}


/*
|--------------------------------------------------------------------------
| Save Sent Item
|--------------------------------------------------------------------------
*/

function saveSentItem(item) {

  const history =
    getStoredHistory();

  history.unshift(item);

  localStorage.setItem(
    "sentrix_team_sends",
    JSON.stringify(history)
  );

}


/*
|--------------------------------------------------------------------------
| Severity Styles
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| Team Connection
|--------------------------------------------------------------------------
*/

export default function TeamConnection() {

  const [searchParams] =
    useSearchParams();


  const type =
    searchParams.get("type");


  const incidentId =
    searchParams.get("id");


  /*
  |--------------------------------------------------------------------------
  | Incidents
  |--------------------------------------------------------------------------
  */

  const storedIncidents =
    getStoredIncidents();


  const allIncidents = [

    ...storedIncidents,

    ...MOCK_INCIDENTS,

  ];


  const incident =
    type === "incident"
      ? allIncidents.find(
          (inc) =>
            inc.id === incidentId
        )
      : null;


  /*
  |--------------------------------------------------------------------------
  | Form State
  |--------------------------------------------------------------------------
  */

  const [
    recipientId,
    setRecipientId,
  ] = useState("");


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    notification,
    setNotification,
  ] = useState(null);


  const [
    sentHistory,
    setSentHistory,
  ] = useState(
    getStoredHistory()
  );


  const [
    historyTab,
    setHistoryTab,
  ] = useState("inbox");


  /*
  |--------------------------------------------------------------------------
  | Inbox
  |--------------------------------------------------------------------------
  */

  const inboxMessages = [

    ...MOCK_INCOMING_MESSAGES,

    ...sentHistory.filter(
      (h) =>
        h.recipientId ===
        CURRENT_USER_ID
    ),

  ];


  /*
  |--------------------------------------------------------------------------
  | Send Message
  |--------------------------------------------------------------------------
  */

  const handleSend = (e) => {

    e.preventDefault();

    setNotification(null);


    if (!recipientId) {

      setNotification({

        type:
          "error",

        message:
          "Please select a recipient.",

      });

      return;

    }


    if (!message.trim()) {

      setNotification({

        type:
          "error",

        message:
          "Please describe what you need them to do.",

      });

      return;

    }


    const recipient =
      TEAM_MEMBERS.find(
        (m) =>
          m.id === recipientId
      );


    const item =

      type === "crsi"

        ? {

            label:
              "CRSI Security Score Report",

            detail:
              `${MOCK_CRSI_SUMMARY.overallScore} — ${MOCK_CRSI_SUMMARY.maturityLevel}`,

          }

        : incident

        ? {

            label:
              incident.id,

            detail:
              incident.title,

          }

        : {

            label:
              "General",

            detail:
              "No specific item attached",

          };


    const sentItem = {

      id:
        `SEND-${Date.now()}`,

      senderId:
        CURRENT_USER_ID,

      senderName:
        CURRENT_USER_NAME,

      recipientId:
        recipient.id,

      recipientName:
        recipient.name,

      recipientRole:
        recipient.role,

      itemLabel:
        item.label,

      itemDetail:
        item.detail,

      message:
        message.trim(),

      sentAt:
        new Date().toLocaleString(
          "en-US",
          {
            dateStyle:
              "medium",

            timeStyle:
              "short",
          }
        ),

    };


    saveSentItem(
      sentItem
    );


    setSentHistory(
      getStoredHistory()
    );


    setNotification({

      type:
        "success",

      message:
        `Sent to ${recipient.name} successfully.`,

    });


    setRecipientId("");

    setMessage("");

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

      <div className="flex-1 flex flex-col">


        <main className="flex-1 overflow-y-auto p-8 space-y-6 max-w-3xl">


          {/* =====================================================
              TITLE
          ===================================================== */}

          <div>

            <h1 className="text-2xl font-bold">
              Team Connection
            </h1>

            <p className="text-gray-400 text-sm">

              Send an incident or a security score report to a team member

            </p>

          </div>


          {/* =====================================================
              INCIDENT ATTACHED
          ===================================================== */}

          {type === "incident" &&
            incident && (

              <div className="bg-[#0c1220] border border-white/10 rounded-xl p-5 flex items-center gap-4">

                <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center text-red-400 shrink-0">

                  <ShieldAlert
                    size={20}
                  />

                </div>


                <div className="flex-1">

                  <p className="font-semibold">
                    {incident.id}
                  </p>

                  <p className="text-sm text-gray-400">
                    {incident.title}
                  </p>

                </div>


                <span
                  className={`text-xs px-2.5 py-1 rounded-full border ${
                    severityStyle[
                      incident.severity
                    ] ||
                    severityStyle.Medium
                  }`}
                >

                  {incident.severity}

                </span>

              </div>

            )}


          {/* =====================================================
              CRSI ATTACHED
          ===================================================== */}

          {type === "crsi" && (

            <div className="bg-[#0c1220] border border-white/10 rounded-xl p-5 flex items-center gap-4">

              <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 shrink-0">

                <BarChart3
                  size={20}
                />

              </div>


              <div className="flex-1">

                <p className="font-semibold">
                  CRSI Security Score Report
                </p>

                <p className="text-sm text-gray-400">

                  Overall Score:{" "}

                  {
                    MOCK_CRSI_SUMMARY.overallScore
                  }

                  {" — "}

                  {
                    MOCK_CRSI_SUMMARY.maturityLevel
                  }

                </p>

              </div>

            </div>

          )}


          {/* =====================================================
              GENERAL MESSAGE
          ===================================================== */}

          {!type && (

            <div className="bg-[#0c1220] border border-white/10 rounded-xl p-5 text-sm text-gray-500">

              No specific item attached.

              {" "}You can still send a general message to a team member below, or go to an{" "}

              <Link
                to="/incidents"
                className="text-emerald-400 hover:underline"
              >
                incident
              </Link>

              {" "}or the{" "}

              <Link
                to="/crsi-assessment"
                className="text-emerald-400 hover:underline"
              >
                CRSI Assessment
              </Link>

              {" "}and use "Send to Team" there.

            </div>

          )}


          {/* =====================================================
              NOTIFICATION
          ===================================================== */}

          {notification && (

            <div
              className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
                notification.type ===
                "success"

                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"

                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}
            >

              {notification.message}

            </div>

          )}


          {/* =====================================================
              SEND FORM
          ===================================================== */}

          <form
            onSubmit={
              handleSend
            }
            className="bg-[#0c1220] border border-white/10 rounded-xl p-6 space-y-4"
          >


            {/* Send To */}

            <div>

              <label className="text-xs text-gray-400 mb-1 block">

                Send to

              </label>


              <select
                value={recipientId}
                onChange={(e) =>
                  setRecipientId(
                    e.target.value
                  )
                }
                className="w-full bg-[#070b16] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none"
              >

                <option value="">
                  Select a team member
                </option>


                {TEAM_MEMBERS.map(
                  (member) => (

                    <option
                      key={
                        member.id
                      }
                      value={
                        member.id
                      }
                    >

                      {member.name}

                      {" — "}

                      {member.role}

                    </option>

                  )
                )}

              </select>

            </div>


            {/* Message */}

            <div>

              <label className="text-xs text-gray-400 mb-1 block">

                What do you need them to do?

              </label>


              <textarea
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                rows={4}
                placeholder="e.g. Please review and confirm this incident has been contained."
                className="w-full bg-[#070b16] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none placeholder:text-gray-600 resize-none"
              />

            </div>


            {/* Send */}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-green-600 text-[#04140b] font-bold py-2.5 rounded-lg hover:opacity-90 transition"
            >

              <Send
                size={16}
              />

              Send

            </button>


          </form>


          {/* =====================================================
              INBOX / SENT
          ===================================================== */}

          <div className="bg-[#0c1220] border border-white/10 rounded-xl p-6">


            {/* Tabs */}

            <div className="flex gap-2 mb-4 border-b border-white/10">


              {/* Inbox */}

              <button
                onClick={() =>
                  setHistoryTab(
                    "inbox"
                  )
                }
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border-b-2 transition ${
                  historyTab ===
                  "inbox"

                    ? "border-emerald-400 text-emerald-400"

                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >

                <InboxIcon
                  size={14}
                />

                Inbox


                {inboxMessages.length >
                  0 && (

                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full">

                    {
                      inboxMessages.length
                    }

                  </span>

                )}

              </button>


              {/* Sent */}

              <button
                onClick={() =>
                  setHistoryTab(
                    "sent"
                  )
                }
                className={`px-3 py-2 text-sm font-semibold border-b-2 transition ${
                  historyTab ===
                  "sent"

                    ? "border-emerald-400 text-emerald-400"

                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >

                Sent by You

              </button>


            </div>


            {/* =================================================
                INBOX
            ================================================= */}

            {historyTab ===
            "inbox" ? (

              <div className="space-y-3">


                {inboxMessages.length ===
                  0 && (

                  <p className="text-sm text-gray-600">
                    No messages yet.
                  </p>

                )}


                {inboxMessages.map(
                  (item) => (

                    <div
                      key={item.id}
                      className="flex items-start gap-3 border-b border-white/5 last:border-0 pb-3 last:pb-0"
                    >


                      {/* Avatar */}

                      <div className="w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">

                        {item.senderName
                          .split(" ")
                          .map(
                            (name) =>
                              name[0]
                          )
                          .join("")
                          .slice(0, 2)}

                      </div>


                      <div className="flex-1 text-sm">


                        <p className="text-gray-200">

                          <span className="font-semibold">

                            {
                              item.senderName
                            }

                          </span>

                          {" "}

                          <span className="text-xs text-gray-500">

                            (
                            {
                              item.senderRole
                            }
                            )

                          </span>

                          {" sent you "}

                          <span className="font-semibold">

                            {
                              item.itemLabel
                            }

                          </span>

                        </p>


                        <p className="text-xs text-gray-500 mt-0.5">

                          {
                            item.itemDetail
                          }

                        </p>


                        <p className="text-xs text-gray-400 mt-1">

                          "{item.message}"

                        </p>


                        <p className="text-xs text-gray-700 mt-1">

                          {
                            item.sentAt
                          }

                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (


              /* =================================================
                  SENT
              ================================================= */

              <div className="space-y-3">


                {sentHistory.length ===
                  0 && (

                  <p className="text-sm text-gray-600">

                    You haven't sent anything yet.

                  </p>

                )}


                {sentHistory
                  .slice(0, 10)
                  .map(
                    (item) => (

                      <div
                        key={
                          item.id
                        }
                        className="flex items-start gap-3 border-b border-white/5 last:border-0 pb-3 last:pb-0"
                      >

                        <CheckCircle2
                          size={16}
                          className="text-emerald-400 shrink-0 mt-0.5"
                        />


                        <div className="flex-1 text-sm">


                          <p className="text-gray-200">

                            <span className="font-semibold">

                              {
                                item.itemLabel
                              }

                            </span>

                            {" sent to "}

                            <span className="font-semibold">

                              {
                                item.recipientName
                              }

                            </span>

                            {" ("}

                            {
                              item.recipientRole
                            }

                            {")"}

                          </p>


                          <p className="text-xs text-gray-500 mt-0.5">

                            {
                              item.itemDetail
                            }

                          </p>


                          <p className="text-xs text-gray-600 mt-1">

                            "{item.message}"

                          </p>


                          <p className="text-xs text-gray-700 mt-1">

                            {
                              item.sentAt
                            }

                          </p>


                        </div>

                      </div>

                    )
                  )}

              </div>

            )}

          </div>


        </main>

      </div>

    </div>

  );

}
