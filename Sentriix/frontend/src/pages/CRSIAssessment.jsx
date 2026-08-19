import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Gauge,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { apiService } from "../services/api";

const generateDynamicDays = () => {
  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    days.push({
      date: dateString,
      score: i === 0 ? 91.4 : 72 - (i * 2),
      status: "Good"
    });
  }
  return days;
};

const DEFAULT_DAILY_SCORES = generateDynamicDays();

const DEFAULT_BREAKDOWN = [
  { name: "Identify & Access", score: 84.4 },
  { name: "Network Security", score: 94 },
  { name: "Endpoint Security", score: 96.4 },
  { name: "Detect & Respond", score: 86.8 },
  { name: "Backup & Recovery", score: 96.4 },
  { name: "NCA Controls", score: 91.6 },
];

export default function CRSIAssessment() {
  const navigate = useNavigate();

  // نجعل القيمة الافتراضية دائماً تبدأ بيوم اليوم وتثبت عليه
  const [dailyScores, setDailyScores] = useState(DEFAULT_DAILY_SCORES);
  const [selectedDay, setSelectedDay] = useState(DEFAULT_DAILY_SCORES[0]);
  const [breakdown, setBreakdown] = useState(DEFAULT_BREAKDOWN);
  const [maturityLevel, setMaturityLevel] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCRSIPosture = async () => {
      try {
        const data = await apiService.getCRSIPosture().catch(() => null);
        if (isMounted && data) {
          if (data.breakdown && Array.isArray(data.breakdown) && data.breakdown.length > 0) {
            setBreakdown(data.breakdown);
          }
          if (data.maturity_level) setMaturityLevel(data.maturity_level);
        }
      } catch (err) {
        console.warn("Using fallback CRSI assessment data:", err);
      }
    };

    fetchCRSIPosture();
  }, []);

  const getScoreStatus = (score) => {
    if (score >= 80) {
      return {
        label: "Excellent",
        className: "text-emerald-400",
      };
    }
    if (score >= 60) {
      return {
        label: "Good",
        className: "text-emerald-400",
      };
    }
    if (score >= 40) {
      return {
        label: "Moderate",
        className: "text-yellow-400",
      };
    }
    return {
      label: "Critical",
      className: "text-red-400",
    };
  };
// اعتماد الـ breakdown الوارد من السيرفر حصرياً لكل يوم مختار
  const dayBreakdown =
    (selectedDay?.breakdown && selectedDay.breakdown.length > 0)
      ? selectedDay.breakdown
      : (selectedDay?.breakdown || []);

  const scoreStatus = getScoreStatus(selectedDay.score);
  const previousDay = dailyScores[1] || dailyScores[0];
  const scoreDifference = Number((selectedDay.score - previousDay.score).toFixed(1));

  return (
    <div className="min-h-screen bg-[#070b16] text-[#eef5f1] flex">
      <Sidebar />

      <main className="flex-1 min-w-0">
        <header className="px-8 py-7 border-b border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Gauge size={20} className="text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">
              CRSI Assessment
            </span>
          </div>

          <h1 className="text-3xl font-bold">CRSI Assessment</h1>
          <p className="text-sm text-gray-500 mt-1">
            Daily assessment of the organization's overall security posture and cyber resilience index.
          </p>
        </header>

        <div className="p-8 max-w-[1250px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Security score for</p>
              <div className="flex items-center gap-2">
                <CalendarDays size={17} className="text-emerald-400" />
                <span className="font-semibold">{selectedDay.date}</span>
              </div>
            </div>

            <select
              value={selectedDay.date}
              onChange={(e) => {
                const selected = dailyScores.find(
                  (day) => day.date === e.target.value
                );
                if (selected) {
                  setSelectedDay(selected);
                }
              }}
              className="bg-[#0c1220] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-300 outline-none"
            >
              {dailyScores.map((day) => (
                <option
                  key={day.date}
                  value={day.date}
                  className="bg-[#0c1220]"
                >
                  {day.date}
                </option>
              ))}
            </select>
          </div>

          <div className="grid lg:grid-cols-2 gap-5 mb-6">
            <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-7">
              <div className="flex items-center justify-between mb-7">
                <div>
                  <h2 className="text-xl font-semibold">Overall Security Score</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Organization-wide security posture score
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <ShieldCheck size={20} className="text-emerald-400" />
                </div>
              </div>

              <div className="flex justify-center py-5">
                <ScoreCircle score={selectedDay.score} />
              </div>

              <div className="text-center">
                <p className={`text-xl font-semibold ${scoreStatus.className}`}>
                  {selectedDay.maturity_level || maturityLevel || scoreStatus.label}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Resilience level for {selectedDay.date} ·{" "}
                  {selectedDay.incident_count ?? 0} incident(s) that day
                </p>
              </div>

              <div className="flex justify-center mt-6">
                <div
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                    scoreDifference >= 0
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {scoreDifference >= 0 ? (
                    <ArrowUpRight size={15} />
                  ) : (
                    <ArrowDownRight size={15} />
                  )}
                  {Math.abs(scoreDifference)} points compared with previous day
                </div>
              </div>
            </section>

            <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-7">
              <div className="mb-8">
                <h2 className="text-xl font-semibold">Score Breakdown</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Control-area breakdown for {selectedDay.date} · NCA / ISO / NIST alignment
                </p>
              </div>

              <div className="space-y-6">
                {dayBreakdown.map((item) => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">{item.name}</span>
                      <span className="text-sm font-semibold text-gray-300">
                        {item.score} / 100
                      </span>
                    </div>

                    <div className="w-full h-2 bg-[#172130] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.score >= 70
                            ? "bg-gradient-to-r from-emerald-500 to-green-400"
                            : item.score >= 40
                            ? "bg-gradient-to-r from-yellow-500 to-amber-400"
                            : "bg-gradient-to-r from-red-600 to-red-400"
                        }`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="bg-[#0c1220] border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold">Daily Security Score History</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Track the organization's security posture trend over time.
                </p>
              </div>
              <CalendarDays size={18} className="text-emerald-400" />
            </div>

            <div className="grid grid-cols-5 gap-3">
              {dailyScores.map((day) => (
                <button
                  key={day.date}
                  onClick={() => setSelectedDay(day)}
                  className={`text-left p-4 rounded-xl border transition ${
                    selectedDay.date === day.date
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-white/5 bg-[#070b16] hover:border-emerald-500/20"
                  }`}
                >
                  <p className="text-[11px] text-gray-500 mb-3">{day.date}</p>
                  <p className="text-2xl font-bold">
                    {day.score}
                    <span className="text-xs text-gray-600"> / 100</span>
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      day.score >= 70
                        ? "text-emerald-400"
                        : day.score >= 40
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {day.status}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-gradient-to-r from-emerald-500/10 to-green-500/5 border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Lightbulb size={21} className="text-emerald-400" />
                </div>

                <div>
                  <h3 className="font-semibold text-white">CRSI Recommendations</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                    View recommendations generated dynamically from the security score breakdown and automated CRSI response playbooks.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/crsi-recommendations")}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-green-600 text-[#04140b] font-bold text-sm px-5 py-3 rounded-lg hover:opacity-90 transition shrink-0 shadow-lg shadow-emerald-500/10"
              >
                View Recommendations
                <ChevronRight size={17} />
              </button>
            </div>
          </section>

          <div className="flex items-center gap-2 mt-6 text-xs text-gray-500">
            <CalendarDays size={15} />
            Daily CRSI evaluated for {selectedDay.date} — the organization-wide
            cumulative score is shown on the CRSI Recommendations page
          </div>
        </div>
      </main>
    </div>
  );
}

function ScoreCircle({ score }) {
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-52 h-52">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#172130"
          strokeWidth="13"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444"}
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl font-bold">{score}</span>
          <span className="text-lg text-gray-500 ml-1">/100</span>
        </div>
      </div>
    </div>
  );
}
