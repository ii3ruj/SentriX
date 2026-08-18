import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Send,
  ShieldAlert,
  BarChart3,
  CheckCircle2,
  Inbox as InboxIcon,
  Loader2,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { apiService } from "../services/api";


const MOCK_INCIDENTS = [
  { id: "INC-0001", title: "Ransomware detected on Server-01", severity: "Critical" },
  { id: "INC-0002", title: "Unusual login from foreign location", severity: "High" },
  { id: "INC-0003", title: "Multiple failed login attempts", severity: "Medium" },
  { id: "INC-0004", title: "Data exfiltration attempt blocked", severity: "High" },
  { id: "INC-0005", title: "Brute force attack detected", severity: "High" },
  { id: "INC-0006", title: "Suspicious file execution", severity: "Low" },
  { id: "INC-0007", title: "Phishing email detected", severity: "Medium" },
  { id: "INC-0008", title: "Privilege escalation attempt", severity: "High" },
  { id: "INC-0009", title: "Malware communication blocked", severity: "Critical" },
  { id: "INC-0010", title: "Unauthorized access to database", severity: "Critical" },
];

function getStoredIncidents() {
  try {
    return JSON.parse(localStorage.getItem("sentrix_incidents") || "[]");
  } catch {
    return [];
  }
}

const MOCK_CRSI_SUMMARY = {
  overallScore: "6.8 / 10",
  maturityLevel: "Moderate",
};

const CURRENT_USER_ID = "admin";
const CURRENT_USER_NAME = "Ruba Aljuhani";

const TEAM_MEMBERS = [
  { id: "admin", name: "Ruba Aljuhani", role: "SOC Manager & IR Admin" },
  { id: "analyst1", name: "Fatima Salem Baobayd", role: "SOC Tier 1 Analyst" },
  { id: "analyst2", name: "Remas Jamaan AlZhrani", role: "SOC Tier 2 Analyst" },
  { id: "forensics", name: "Razan Abdullah Alghamdi", role: "Digital Forensics Specialist" },
];

const MOCK_INCOMING_MESSAGES = [
  {
    id: "MSG-SEED-001",
    senderId: "admin",
    senderName: "Ruba Aljuhani",
    senderRole: "SOC Manager & IR Admin",
    recipientId: "forensics",
    itemLabel: "INC-218",
    itemDetail: "Auto Simulated Brute Force",
    message: "Initial triage completed. The source IP is repeatedly targeting the authentication portal. The incident has been escalated to Digital Forensics for further investigation, evidence preservation, and analysis of the affected account activity.",
    sentAt: "2026-08-19 02:10 AM",
  },
  {
    id: "MSG-SEED-002",
    senderId: "analyst1",
    senderName: "Fatima Salem Baobayd",
    senderRole: "SOC Tier 1 Analyst",
    recipientId: "admin",
    itemLabel: "INC-2182",
    itemDetail: "Auto Simulated Brute Force",
    message: "Initial triage completed. Source IP is hammering the auth portal. Escalated for your review, Admin.",
    sentAt: "2026-08-19 02:10 AM",
  },
  {
    id: "MSG-SEED-003",
    senderId: "analyst2",
    senderName: "Remas Jamaan AlZhrani",
    senderRole: "SOC Tier 2 Analyst",
    recipientId: "admin",
    itemLabel: "INC-2178",
    itemDetail: "Malware communication blocked",
    message: "Deep packet inspection verified the C2 callback was successfully dropped by the firewall.",
    sentAt: "2026-08-19 01:45 AM",
  },
  {
    id: "MSG-SEED-004",
    senderId: "forensics",
    senderName: "Razan Abdullah Alghamdi",
    senderRole: "Digital Forensics Specialist",
    recipientId: "admin",
    itemLabel: "CRSI Security Score Report",
    itemDetail: "Overall Posture & Weak Control Domains",
    message: "Forensic memory dump acquired from the affected cloud instance. Awaiting admin sign-off.",
    sentAt: "2026-08-19 01:15 AM",
  },
];
function getStoredHistory() {
  try {
    return JSON.parse(localStorage.getItem("sentrix_team_sends") || "[]");
  } catch {
    return [];
  }
}

function saveSentItem(item) {
  const history = getStoredHistory();
  history.unshift(item);
  localStorage.setItem("sentrix_team_sends", JSON.stringify(history));
}

const severityStyle = {
  Critical: "bg-red-500/10 text-red-400 border-red-500/30",
  High: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

export default function TeamConnection() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const incidentId = searchParams.get("id");

  const [liveIncidents, setLiveIncidents] = useState([]);
  const [recipientId, setRecipientId] = useState("");
  const [message, setMessage] = useState("");
  const [notification, setNotification] = useState(null);
  const [sentHistory, setSentHistory] = useState(getStoredHistory());
  const [apiIncomingMessages, setApiIncomingMessages] = useState([]);
  const [historyTab, setHistoryTab] = useState("inbox");
  const [isSending, setIsSending] = useState(false);

  // جلب الحوادث الحية والرسائل بصورة دورية
  useEffect(() => {
    let isMounted = true;

    const fetchLiveChatAndIncidents = async () => {
      try {
        // 1. جلب الحوادث الحية
        const incData = await apiService.getIncidents().catch(() => []);
        if (isMounted && Array.isArray(incData) && incData.length > 0) {
          setLiveIncidents(incData);
        }

        // 2. جلب الرسائل من الباك إند
        const msgData = await apiService.getTeamMessages().catch(() => []);
        if (isMounted && Array.isArray(msgData) && msgData.length > 0) {
          setApiIncomingMessages(msgData);
        }
      } catch (err) {
        console.warn("Using fallback team messages & incidents:", err);
      }
    };

    fetchLiveChatAndIncidents();
    const interval = setInterval(fetchLiveChatAndIncidents, 3500); // تحديث كل 3.5 ثانية

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const storedIncidents = getStoredIncidents();
  const allIncidents = [
    ...liveIncidents,
    ...storedIncidents,
    ...MOCK_INCIDENTS,
  ];

  const incident =
    type === "incident"
      ? allIncidents.find((inc) => inc.id === incidentId)
      : null;

  // دمج الرسائل الواردة
  const inboxMessages = [
    ...apiIncomingMessages,
    ...MOCK_INCOMING_MESSAGES,
    ...sentHistory.filter((h) => h.recipientId === CURRENT_USER_ID),
  ];

  const handleSend = async (e) => {
    e.preventDefault();
    setNotification(null);

    if (!recipientId) {
      setNotification({
        type: "error",
        message: "Please select a recipient.",
      });
      return;
    }

    if (!message.trim()) {
      setNotification({
        type: "error",
        message: "Please describe what you need them to do.",
      });
      return;
    }

    setIsSending(true);
    const recipient = TEAM_MEMBERS.find((m) => m.id === recipientId);

    const item =
      type === "crsi"
        ? {
            label: "CRSI Security Score Report",
            detail: `${MOCK_CRSI_SUMMARY.overallScore} — ${MOCK_CRSI_SUMMARY.maturityLevel}`,
          }
        : incident
        ? {
            label: incident.id,
            detail: incident.title,
          }
        : {
            label: "General Security Advisory",
            detail: "No specific incident attached",
          };

    const sentItem = {
      id: `SEND-${Date.now()}`,
      senderId: CURRENT_USER_ID,
      senderName: CURRENT_USER_NAME,
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientRole: recipient.role,
      itemLabel: item.label,
      itemDetail: item.detail,
      message: message.trim(),
      sentAt: new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    };

    try {
      // إرسال الرسالة إلى الباك إند
      await apiService.sendTeamMessage(sentItem).catch((err) => {
        console.warn("Sent to local store fallback:", err);
      });

      saveSentItem(sentItem);
      setSentHistory(getStoredHistory());

      setNotification({
        type: "success",
        message: `Message and context dispatched to ${recipient.name} successfully.`,
      });

      setRecipientId("");
      setMessage("");
    } catch (err) {
      saveSentItem(sentItem);
      setSentHistory(getStoredHistory());
      setNotification({
        type: "success",
        message: `Dispatched to ${recipient.name}.`,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b16] text-[#eef5f1] flex">
      {/* UNIFIED SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-8 space-y-6 max-w-3xl">
          {/* TITLE */}
          <div>
            <h1 className="text-2xl font-bold">Team Connection</h1>
            <p className="text-gray-400 text-sm">
              Send an incident or a security score report to a team member for collaborative triage
            </p>
          </div>

          {/* INCIDENT ATTACHED */}
          {type === "incident" && incident && (
            <div className="bg-[#0c1220] border border-white/10 rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center text-red-400 shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{incident.id}</p>
                <p className="text-sm text-gray-400">{incident.title}</p>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full border ${
                  severityStyle[incident.severity] || severityStyle.Medium
                }`}
              >
                {incident.severity}
              </span>
            </div>
          )}

          {/* CRSI ATTACHED */}
          {type === "crsi" && (
            <div className="bg-[#0c1220] border border-white/10 rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 shrink-0">
                <BarChart3 size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold">CRSI Security Score Report</p>
                <p className="text-sm text-gray-400">
                  Overall Score: {MOCK_CRSI_SUMMARY.overallScore} — {MOCK_CRSI_SUMMARY.maturityLevel}
                </p>
              </div>
            </div>
          )}

          {/* GENERAL MESSAGE NOTICE */}
          {!type && (
            <div className="bg-[#0c1220] border border-white/10 rounded-xl p-5 text-sm text-gray-500">
              No specific item attached. You can still send a general message to a team member below, or go to an{" "}
              <Link to="/incidents" className="text-emerald-400 hover:underline">
                incident
              </Link>{" "}
              or the{" "}
              <Link to="/crsi-assessment" className="text-emerald-400 hover:underline">
                CRSI Assessment
              </Link>{" "}
              and use "Send to Team" there.
            </div>
          )}

          {/* NOTIFICATION */}
          {notification && (
            <div
              className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
                notification.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}
            >
              {notification.message}
            </div>
          )}

          {/* SEND FORM */}
          <form
            onSubmit={handleSend}
            className="bg-[#0c1220] border border-white/10 rounded-xl p-6 space-y-4"
          >
            {/* Send To */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Send to</label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full bg-[#070b16] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none text-gray-200"
              >
                <option value="">Select a team member</option>
                {TEAM_MEMBERS.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} — {member.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                What do you need them to do?
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="e.g. Please review and confirm this incident has been contained."
                className="w-full bg-[#070b16] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none text-gray-200 placeholder:text-gray-600 resize-none"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={isSending}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-green-600 text-[#04140b] font-bold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send</span>
                </>
              )}
            </button>
          </form>

          {/* INBOX / SENT TABS */}
          <div className="bg-[#0c1220] border border-white/10 rounded-xl p-6">
            <div className="flex gap-2 mb-4 border-b border-white/10">
              {/* Inbox */}
              <button
                onClick={() => setHistoryTab("inbox")}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border-b-2 transition ${
                  historyTab === "inbox"
                    ? "border-emerald-400 text-emerald-400"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                <InboxIcon size={14} />
                Inbox
                {inboxMessages.length > 0 && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full">
                    {inboxMessages.length}
                  </span>
                )}
              </button>

              {/* Sent */}
              <button
                onClick={() => setHistoryTab("sent")}
                className={`px-3 py-2 text-sm font-semibold border-b-2 transition ${
                  historyTab === "sent"
                    ? "border-emerald-400 text-emerald-400"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                Sent by You
              </button>
            </div>

            {/* INBOX TAB */}
            {historyTab === "inbox" ? (
              <div className="space-y-3">
                {inboxMessages.length === 0 && (
                  <p className="text-sm text-gray-600">No messages yet.</p>
                )}

                {inboxMessages.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 border-b border-white/5 last:border-0 pb-3 last:pb-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                      {item.senderName
                        ? item.senderName.split(" ").map((n) => n[0]).join("").slice(0, 2)
                        : "SO"}
                    </div>

                    <div className="flex-1 text-sm">
                      <p className="text-gray-200">
                        <span className="font-semibold">{item.senderName}</span>{" "}
                        <span className="text-xs text-gray-500">({item.senderRole || "Analyst"})</span>
                        {" sent you "}
                        <span className="font-semibold text-emerald-400">{item.itemLabel}</span>
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">{item.itemDetail}</p>
                      <p className="text-xs text-gray-300 mt-1 bg-white/[0.02] p-2 rounded border border-white/5">
                        "{item.message}"
                      </p>
                      <p className="text-[11px] text-gray-600 mt-1">{item.sentAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* SENT TAB */
              <div className="space-y-3">
                {sentHistory.length === 0 && (
                  <p className="text-sm text-gray-600">You haven't sent anything yet.</p>
                )}

                {sentHistory.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 border-b border-white/5 last:border-0 pb-3 last:pb-0"
                  >
                    <CheckCircle2
                      size={16}
                      className="text-emerald-400 shrink-0 mt-0.5"
                    />

                    <div className="flex-1 text-sm">
                      <p className="text-gray-200">
                        <span className="font-semibold text-emerald-400">{item.itemLabel}</span>
                        {" sent to "}
                        <span className="font-semibold">{item.recipientName}</span>{" "}
                        <span className="text-xs text-gray-500">({item.recipientRole})</span>
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">{item.itemDetail}</p>
                      <p className="text-xs text-gray-400 mt-1">"{item.message}"</p>
                      <p className="text-[11px] text-gray-600 mt-1">{item.sentAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
