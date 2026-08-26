import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";

import {
  Send,
  ShieldAlert,
  BarChart3,
  CheckCircle2,
  Inbox as InboxIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import { apiService } from "../services/api";


/* =========================================================
   TEAM MEMBERS
   Static UI list only.
   This is NOT incident / CRSI / analytics mock data.
========================================================= */

const TEAM_MEMBERS = [
  {
    id: "admin",
    name: "Ruba Aljuhani",
    role: "SOC Manager & IR Admin",
  },
  {
    id: "analyst1",
    name: "Fatima Salem Baobayd",
    role: "SOC Tier 1 Analyst",
  },
  {
    id: "analyst2",
    name: "Remas Jamaan AlZhrani",
    role: "SOC Tier 2 Analyst",
  },
  {
    id: "forensics",
    name: "Razan Abdullah Alghamdi",
    role: "Digital Forensics Specialist",
  },
];

const CURRENT_USER_ID = "admin";
const CURRENT_USER_NAME = "Ruba Aljuhani";


/* =========================================================
   SEVERITY STYLE
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


/* =========================================================
   NORMALIZE INCIDENT RESPONSE
========================================================= */

function normalizeIncidents(data) {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.incidents)) {
    return data.incidents;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}


/* =========================================================
   NORMALIZE MESSAGE RESPONSE
========================================================= */

function normalizeMessages(data) {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.messages)) {
    return data.messages;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}


/* =========================================================
   TEAM CONNECTION
========================================================= */

export default function TeamConnection() {
  const [searchParams] =
    useSearchParams();

  const type =
    searchParams.get("type");

  const incidentId =
    searchParams.get("id");


  /* =======================================================
     SERVER DATA
  ======================================================= */

  const [
    liveIncidents,
    setLiveIncidents,
  ] = useState([]);

  const [
    apiIncomingMessages,
    setApiIncomingMessages,
  ] = useState([]);


  /* =======================================================
     FORM
  ======================================================= */

  const [
    recipientId,
    setRecipientId,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");


  /* =======================================================
     UI STATE
  ======================================================= */

  const [
    notification,
    setNotification,
  ] = useState(null);

  const [
    historyTab,
    setHistoryTab,
  ] = useState("inbox");

  const [
    isSending,
    setIsSending,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);


  /* =======================================================
     FETCH DATA FROM EXISTING API ONLY
  ======================================================= */

  useEffect(() => {
    let isMounted = true;

    const fetchLiveChatAndIncidents =
      async () => {

        try {

          if (isMounted) {
            setError(null);
          }


          /* =================================================
             INCIDENTS
          ================================================= */

          const incData =
            await apiService.getIncidents();


          if (!isMounted) {
            return;
          }


          setLiveIncidents(
            normalizeIncidents(
              incData
            )
          );


          /* =================================================
             TEAM MESSAGES
          ================================================= */

          const msgData =
            await apiService.getTeamMessages();


          if (!isMounted) {
            return;
          }


          setApiIncomingMessages(
            normalizeMessages(
              msgData
            )
          );


        } catch (err) {

          console.error(
            "Team Connection API Error:",
            err
          );


          if (!isMounted) {
            return;
          }


          /*
           * NO MOCK FALLBACK.
           *
           * If the server fails,
           * show empty server state.
           */

          setLiveIncidents([]);
          setApiIncomingMessages([]);


          setError(
            err?.message ||
              "Unable to load team connection data from the server."
          );


        } finally {

          if (isMounted) {
            setLoading(false);
          }

        }

      };


    fetchLiveChatAndIncidents();


    /*
     * Refresh real server data.
     */

    const interval =
      setInterval(
        fetchLiveChatAndIncidents,
        3500
      );


    return () => {
      isMounted = false;
      clearInterval(interval);
    };

  }, []);


  /* =======================================================
     FIND INCIDENT FROM SERVER DATA
  ======================================================= */

  const incident =
    type === "incident"
      ? liveIncidents.find(
          (inc) =>
            String(inc.id) ===
            String(incidentId)
        )
      : null;


  /* =======================================================
     INBOX
  ======================================================= */

  const inboxMessages =
    apiIncomingMessages.filter(
      (item) => {

        const recipient =
          item.recipientId ??
          item.recipient_id;


        /*
         * If the server provides recipientId,
         * show only messages addressed to current user.
         */

        if (recipient) {

          return (
            String(recipient) ===
            String(
              CURRENT_USER_ID
            )
          );

        }


        /*
         * If backend returns inbox messages
         * without recipient ID, display them
         * as returned by the server.
         */

        return true;

      }
    );


  /* =======================================================
     SEND MESSAGE
  ======================================================= */

  const handleSend =
    async (e) => {

      e.preventDefault();

      setNotification(null);


      /* =====================================================
         VALIDATION
      ===================================================== */

      if (!recipientId) {

        setNotification({
          type: "error",
          message:
            "Please select a recipient.",
        });

        return;
      }


      if (!message.trim()) {

        setNotification({
          type: "error",
          message:
            "Please describe what you need them to do.",
        });

        return;
      }


      /* =====================================================
         FIND RECIPIENT
      ===================================================== */

      const recipient =
        TEAM_MEMBERS.find(
          (member) =>
            String(member.id) ===
            String(recipientId)
        );


      if (!recipient) {

        setNotification({
          type: "error",
          message:
            "Selected team member could not be found.",
        });

        return;
      }


      setIsSending(true);


      /* =====================================================
         ATTACHED CONTEXT
      ===================================================== */

      let item = null;


      if (type === "crsi") {

        item = {
          label:
            "CRSI Security Score Report",

          detail:
            "CRSI Security Assessment",
        };

      } else if (incident) {

        /*
         * Real incident information
         * comes from the server.
         */

        item = {
          label:
            incident.id,

          detail:
            incident.title ??
            "Not provided",
        };

      } else {

        /*
         * No incident exists.
         *
         * Do not invent a fake security item.
         */

        item = {
          label:
            "Not provided",

          detail:
            "Not provided",
        };

      }


      /* =====================================================
         MESSAGE PAYLOAD
      ===================================================== */

      const sentItem = {

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
          new Date().toISOString(),

        contextType:
          type || null,

        incidentId:
          incident?.id ??
          incidentId ??
          null,

      };


      try {

        /* ===================================================
           SEND TO EXISTING BACKEND API
        =================================================== */

        await apiService.sendTeamMessage(
          sentItem
        );


        /*
         * IMPORTANT:
         *
         * No localStorage.
         * No fake local message.
         *
         * Server remains source of truth.
         */

        setNotification({
          type: "success",
          message:
            `Message sent to ${recipient.name} successfully.`,
        });


        setRecipientId("");
        setMessage("");


        /* ===================================================
           REFRESH FROM SERVER
        =================================================== */

        const updatedMessages =
          await apiService.getTeamMessages();


        setApiIncomingMessages(
          normalizeMessages(
            updatedMessages
          )
        );


      } catch (err) {

        console.error(
          "Send team message error:",
          err
        );


        setNotification({
          type: "error",
          message:
            err?.message ||
            "Failed to send the message to the server.",
        });


      } finally {

        setIsSending(false);

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
                text-gray-400
              "
            >
              Loading team connection...
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

      <Sidebar />


      <div
        className="
          flex-1

          flex
          flex-col

          min-w-0

          overflow-x-hidden
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
            sm:space-y-6

            max-w-4xl

            w-full

            min-w-0
          "
        >

          {/* =================================================
              TITLE
          ================================================= */}

          <div>

            <h1
              className="
                text-2xl
                sm:text-3xl

                font-bold

                leading-tight
              "
            >
              Team Connection
            </h1>


            <p
              className="
                text-gray-400
                text-sm
                mt-1
                leading-relaxed
              "
            >
              Send an incident or a security score
              report to a team member for collaborative triage.
            </p>

          </div>


          {/* =================================================
              ERROR
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
                  Unable to load server data
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
              INCIDENT CONTEXT
          ================================================= */}

          {type === "incident" && (

            incident ? (

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

                  gap-4

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
                    flex-1
                    min-w-0
                  "
                >

                  <p
                    className="
                      font-semibold
                      break-all
                    "
                  >
                    {incident.id}
                  </p>


                  <p
                    className="
                      text-sm
                      text-gray-400

                      mt-0.5

                      break-words
                    "
                  >
                    {incident.title ??
                      "Not provided"}
                  </p>

                </div>


                <span
                  className={`
                    text-xs

                    px-2.5
                    py-1

                    rounded-full

                    border

                    whitespace-nowrap

                    w-fit

                    ${
                      severityStyle[
                        incident.severity
                      ] ??
                      "bg-gray-500/10 text-gray-400 border-gray-500/20"
                    }
                  `}
                >
                  {incident.severity ??
                    "Not provided"}
                </span>

              </div>

            ) : (

              <div
                className="
                  bg-[#0c1220]

                  border
                  border-white/10

                  rounded-xl

                  p-4

                  text-sm
                  text-gray-500
                "
              >
                This incident was not returned by the server.
              </div>

            )

          )}


          {/* =================================================
              CRSI CONTEXT
          ================================================= */}

          {type === "crsi" && (

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

                gap-4
              "
            >

              <div
                className="
                  w-10
                  h-10

                  rounded-lg

                  bg-blue-500/15

                  flex
                  items-center
                  justify-center

                  text-blue-400

                  shrink-0
                "
              >

                <BarChart3
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
                  "
                >
                  CRSI Security Score Report
                </p>


                <p
                  className="
                    text-sm
                    text-gray-400

                    mt-0.5

                    leading-relaxed
                  "
                >
                  Current CRSI assessment will be
                  handled by the server-side workflow.
                </p>

              </div>

            </div>

          )}


          {/* =================================================
              GENERAL CONTEXT
          ================================================= */}

          {!type && (

            <div
              className="
                bg-[#0c1220]

                border
                border-white/10

                rounded-xl

                p-4
                sm:p-5

                text-sm
                text-gray-500

                leading-relaxed
              "
            >

              No specific item attached. You can
              still send a general message to a team
              member below, or go to an{" "}

              <Link
                to="/incidents"
                className="
                  text-emerald-400
                  hover:underline
                "
              >
                incident
              </Link>{" "}

              or the{" "}

              <Link
                to="/crsi-assessment"
                className="
                  text-emerald-400
                  hover:underline
                "
              >
                CRSI Assessment
              </Link>{" "}

              and use "Send to Team" there.

            </div>

          )}


          {/* =================================================
              NOTIFICATION
          ================================================= */}

          {notification && (

            <div
              className={`
                rounded-lg

                border

                px-4
                py-3

                text-sm

                leading-relaxed

                ${
                  notification.type ===
                  "success"

                    ? `
                      bg-emerald-500/10
                      border-emerald-500/30
                      text-emerald-300
                    `

                    : `
                      bg-red-500/10
                      border-red-500/30
                      text-red-300
                    `
                }
              `}
            >
              {notification.message}
            </div>

          )}


          {/* =================================================
              SEND FORM
          ================================================= */}

          <form
            onSubmit={
              handleSend
            }
            className="
              bg-[#0c1220]

              border
              border-white/10

              rounded-xl

              p-4
              sm:p-5
              md:p-6

              space-y-4

              min-w-0
            "
          >

            {/* SEND TO */}

            <div>

              <label
                className="
                  text-xs
                  text-gray-400

                  mb-1

                  block
                "
              >
                Send to
              </label>


              <select
                value={
                  recipientId
                }
                onChange={(e) =>
                  setRecipientId(
                    e.target.value
                  )
                }
                className="
                  w-full

                  bg-[#070b16]

                  border
                  border-white/10

                  rounded-lg

                  px-3
                  py-2.5

                  text-sm

                  outline-none

                  text-gray-200

                  focus:border-emerald-500/40

                  transition
                "
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
                      {member.name} —{" "}
                      {member.role}
                    </option>

                  )
                )}

              </select>

            </div>


            {/* MESSAGE */}

            <div>

              <label
                className="
                  text-xs
                  text-gray-400

                  mb-1

                  block
                "
              >
                What do you need them to do?
              </label>


              <textarea
                value={
                  message
                }
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                rows={4}
                placeholder="e.g. Please review and confirm this incident has been contained."
                className="
                  w-full

                  bg-[#070b16]

                  border
                  border-white/10

                  rounded-lg

                  px-3
                  py-2.5

                  text-sm

                  outline-none

                  text-gray-200

                  placeholder:text-gray-600

                  resize-none

                  focus:border-emerald-500/40

                  transition
                "
              />

            </div>


            {/* SEND BUTTON */}

            <button
              type="submit"
              disabled={
                isSending
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

                py-2.5

                rounded-lg

                hover:opacity-90

                transition

                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >

              {isSending ? (

                <>
                  <Loader2
                    size={16}
                    className="
                      animate-spin
                    "
                  />

                  Sending...
                </>

              ) : (

                <>
                  <Send
                    size={16}
                  />

                  Send
                </>

              )}

            </button>

          </form>


          {/* =================================================
              MESSAGE HISTORY
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

            {/* TABS */}

            <div
              className="
                flex

                gap-1
                sm:gap-2

                mb-4

                border-b
                border-white/10

                overflow-x-auto
              "
            >

              <button
                onClick={() =>
                  setHistoryTab(
                    "inbox"
                  )
                }
                className={`
                  flex
                  items-center

                  gap-1.5

                  px-3
                  py-2

                  text-sm
                  font-semibold

                  border-b-2

                  whitespace-nowrap

                  shrink-0

                  transition

                  ${
                    historyTab ===
                    "inbox"

                      ? `
                        border-emerald-400
                        text-emerald-400
                      `

                      : `
                        border-transparent
                        text-gray-500
                        hover:text-gray-300
                      `
                  }
                `}
              >

                <InboxIcon
                  size={14}
                />

                Inbox


                {inboxMessages.length >
                  0 && (

                  <span
                    className="
                      bg-emerald-500/20

                      text-emerald-400

                      text-[10px]

                      px-1.5
                      py-0.5

                      rounded-full
                    "
                  >
                    {
                      inboxMessages.length
                    }
                  </span>

                )}

              </button>


              <button
                onClick={() =>
                  setHistoryTab(
                    "sent"
                  )
                }
                className={`
                  px-3
                  py-2

                  text-sm
                  font-semibold

                  border-b-2

                  whitespace-nowrap

                  shrink-0

                  transition

                  ${
                    historyTab ===
                    "sent"

                      ? `
                        border-emerald-400
                        text-emerald-400
                      `

                      : `
                        border-transparent
                        text-gray-500
                        hover:text-gray-300
                      `
                  }
                `}
              >
                Sent by You
              </button>

            </div>


            {/* =================================================
                INBOX
            ================================================= */}

            {historyTab ===
            "inbox" ? (

              <div
                className="
                  space-y-3
                "
              >

                {inboxMessages.length ===
                  0 && (

                  <p
                    className="
                      text-sm
                      text-gray-600
                    "
                  >
                    No messages returned by the server.
                  </p>

                )}


                {inboxMessages.map(
                  (
                    item,
                    index
                  ) => {

                    const senderName =
                      item.senderName ??
                      item.sender_name;


                    const senderRole =
                      item.senderRole ??
                      item.sender_role;


                    const itemLabel =
                      item.itemLabel ??
                      item.item_label;


                    const itemDetail =
                      item.itemDetail ??
                      item.item_detail;


                    const itemMessage =
                      item.message;


                    const sentAt =
                      item.sentAt ??
                      item.sent_at;


                    return (

                      <div
                        key={
                          item.id ??
                          item.message_id ??
                          index
                        }
                        className="
                          flex
                          items-start

                          gap-3

                          border-b
                          border-white/5

                          last:border-0

                          pb-3
                          last:pb-0

                          min-w-0
                        "
                      >

                        <div
                          className="
                            w-8
                            h-8

                            rounded-full

                            bg-blue-500/15

                            flex
                            items-center
                            justify-center

                            text-blue-400

                            text-xs
                            font-bold

                            shrink-0
                          "
                        >

                          {senderName
                            ? senderName
                                .split(" ")
                                .map(
                                  (n) =>
                                    n[0]
                                )
                                .join("")
                                .slice(
                                  0,
                                  2
                                )
                                .toUpperCase()
                            : "—"}

                        </div>


                        <div
                          className="
                            flex-1
                            min-w-0
                          "
                        >

                          <p
                            className="
                              text-sm
                              text-gray-200

                              leading-relaxed

                              break-words
                            "
                          >

                            <span
                              className="
                                font-semibold
                              "
                            >
                              {senderName ??
                                "Not provided"}
                            </span>


                            {senderRole && (

                              <span
                                className="
                                  text-xs
                                  text-gray-500
                                "
                              >
                                {" "}
                                ({senderRole})
                              </span>

                            )}


                            {itemLabel && (

                              <>
                                {" sent you "}

                                <span
                                  className="
                                    font-semibold
                                    text-emerald-400
                                  "
                                >
                                  {itemLabel}
                                </span>
                              </>

                            )}

                          </p>


                          {itemDetail && (

                            <p
                              className="
                                text-xs
                                text-gray-500

                                mt-0.5

                                break-words
                              "
                            >
                              {itemDetail}
                            </p>

                          )}


                          {itemMessage && (

                            <p
                              className="
                                text-xs
                                text-gray-300

                                mt-1

                                bg-white/[0.02]

                                p-2

                                rounded

                                border
                                border-white/5

                                leading-relaxed

                                break-words
                              "
                            >
                              "{itemMessage}"
                            </p>

                          )}


                          {sentAt && (

                            <p
                              className="
                                text-[11px]
                                text-gray-600

                                mt-1
                              "
                            >
                              {sentAt}
                            </p>

                          )}

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            ) : (

              /* =================================================
                 SENT
              ================================================= */

              <div
                className="
                  space-y-3
                "
              >

                {(() => {

                  const sentMessages =
                    apiIncomingMessages.filter(
                      (item) => {

                        const sender =
                          item.senderId ??
                          item.sender_id;


                        return (
                          String(sender) ===
                          String(
                            CURRENT_USER_ID
                          )
                        );

                      }
                    );


                  if (
                    sentMessages.length ===
                    0
                  ) {

                    return (

                      <p
                        className="
                          text-sm
                          text-gray-600
                        "
                      >
                        No sent messages returned by the server.
                      </p>

                    );

                  }


                  return sentMessages
                    .slice(0, 10)
                    .map(
                      (
                        item,
                        index
                      ) => {

                        const itemLabel =
                          item.itemLabel ??
                          item.item_label;


                        const recipientName =
                          item.recipientName ??
                          item.recipient_name;


                        const recipientRole =
                          item.recipientRole ??
                          item.recipient_role;


                        const itemDetail =
                          item.itemDetail ??
                          item.item_detail;


                        const itemMessage =
                          item.message;


                        const sentAt =
                          item.sentAt ??
                          item.sent_at;


                        return (

                          <div
                            key={
                              item.id ??
                              item.message_id ??
                              index
                            }
                            className="
                              flex
                              items-start

                              gap-3

                              border-b
                              border-white/5

                              last:border-0

                              pb-3
                              last:pb-0

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


                            <div
                              className="
                                flex-1
                                min-w-0
                              "
                            >

                              <p
                                className="
                                  text-sm
                                  text-gray-200

                                  leading-relaxed

                                  break-words
                                "
                              >

                                {itemLabel && (

                                  <span
                                    className="
                                      font-semibold
                                      text-emerald-400
                                    "
                                  >
                                    {itemLabel}
                                  </span>

                                )}


                                {recipientName && (

                                  <>
                                    {" sent to "}

                                    <span
                                      className="
                                        font-semibold
                                      "
                                    >
                                      {recipientName}
                                    </span>
                                  </>

                                )}


                                {recipientRole && (

                                  <span
                                    className="
                                      text-xs
                                      text-gray-500
                                    "
                                  >
                                    {" "}
                                    ({recipientRole})
                                  </span>

                                )}

                              </p>


                              {itemDetail && (

                                <p
                                  className="
                                    text-xs
                                    text-gray-500

                                    mt-0.5

                                    break-words
                                  "
                                >
                                  {itemDetail}
                                </p>

                              )}


                              {itemMessage && (

                                <p
                                  className="
                                    text-xs
                                    text-gray-400

                                    mt-1

                                    leading-relaxed

                                    break-words
                                  "
                                >
                                  "{itemMessage}"
                                </p>

                              )}


                              {sentAt && (

                                <p
                                  className="
                                    text-[11px]
                                    text-gray-600

                                    mt-1
                                  "
                                >
                                  {sentAt}
                                </p>

                              )}

                            </div>

                          </div>

                        );

                      }
                    );

                })()}

              </div>

            )}

          </div>

        </main>

      </div>

    </div>

  );
}