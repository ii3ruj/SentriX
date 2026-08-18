/**
 * SentriX — API Service Layer
 * ---------------------------------------------------------------------------
 * الطبقة الوحيدة التي تعرف عنوان الباك إند.
 * كل الصفحات تستدعي apiService فقط، ولا تتصل بـ DataRobot أو Supabase مباشرة.
 *
 * متغيّر البيئة على Render (Static Site):
 *   VITE_API_URL = https://sentrix-backend-qsnu.onrender.com
 */

const BASE_URL =
  import.meta.env.VITE_API_URL || "https://sentrix-backend-qsnu.onrender.com";

export { BASE_URL };

// دالة مساعدة عامة للطلبات (مزودة بحماية الـ 401 المركزية)
async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

    // 🔒 [نقطة التفتيش المركزية - Server-Side Auth Check]
    // مسارات المصادقة نفسها مستثناة: إعادة التوجيه عليها كانت تعيد تحميل
    // صفحة الدخول قبل ظهور رسالة الخطأ، فيبدو الموقع وكأنه معلّق.
    if (res.status === 401 && !endpoint.startsWith("/api/auth/")) {
      localStorage.removeItem("token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      let detail = "";
      try {
        const body = await res.json();
        detail = body?.detail || "";
      } catch (e) {
        detail = "";
      }
      throw new Error(detail || `HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Request Error at ${endpoint}:`, error);
    throw error;
  }
}

export const apiService = {
  
  // 🔒 Authentication (New)
  login: (credentials) => 
    request("/api/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (userData) => 
    request("/api/auth/register", { method: "POST", body: JSON.stringify(userData) }),
  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },

  // 1. Dashboard Stats
  // يرجع: { attackTypes, totals, severityCounts, trends, crsi }
  getDashboardStats: () => request("/api/dashboard/stats"),

  // 2. Incidents (Intake & List)
  getIncidents: () => request("/api/incidents"),
  getIncidentById: (id) => request(`/api/incidents/${id}`),
  createIncident: (incidentData) =>
    request("/api/incidents", {
      method: "POST",
      body: JSON.stringify(incidentData),
    }),

  // رفع تقارير PDF وتحليلها (مزودة بحماية الـ 401)
  // الحقول المتوقعة في FormData: file, incident_id, actual_time, analyst, sha256
  uploadIncidentPDF: async (formData) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/incidents/upload-pdf`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData, // FormData لا يحتاج تحديد Content-Type يدوياً
    });

    // 🔒 [نقطة التفتيش لرفع الملفات]
    if (res.status === 401) {
      localStorage.removeItem("token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      throw new Error("Unauthorized");
    }

    if (!res.ok) throw new Error("Failed to upload and analyze PDF");
    return await res.json();
  },

  // 3. AI Analysis & Recommendations
  getAIAnalysis: (incidentId) => request(`/api/ai-analysis/${incidentId}`),
  getRecommendations: (incidentId) =>
    request(
      incidentId
        ? `/api/recommendations?incident_id=${incidentId}`
        : "/api/recommendations"
    ),
  getCRSIRecommendations: () => request("/api/crsi-recommendations"),
  getCRSIPosture: () => request("/api/crsi-assessment"),

  // 4. Archiving (P1 - P4 Verification & Retrieval)
  getArchivedIncidents: () => request("/api/archive"),

  // P1 Integrity — يعيد الباك إند حساب البصمة ويقارنها بالمخزّنة
  verifyArchiveHash: (incidentId) =>
    request(`/api/archive/verify/${incidentId}`, {
      method: "POST",
      body: "{}",
    }),

  // رابط الـ PDF الرسمي المولّد والمؤرشف (يُفتح مباشرة في تبويب جديد)
  archiveDownloadUrl: (incidentId) =>
    `${BASE_URL}/api/archive/${incidentId}/download`,

  // 5. Team Connection (Chat / Collab)
  getTeamMessages: () => request("/api/team/messages"),
  sendTeamMessage: (messageData) =>
    request("/api/team/messages", {
      method: "POST",
      body: JSON.stringify(messageData),
    }),

  // 6. Environment Simulator (Test Environment Server)
  startSimulator: () => request("/api/simulator/start", { method: "POST" }),
  stopSimulator: () => request("/api/simulator/stop", { method: "POST" }),
  burstSimulator: (count = 5) =>
    request(`/api/simulator/burst?count=${count}`, { method: "POST" }),
  getSimulatorStatus: () => request("/api/simulator/status"),

  // 7. Diagnostics — يعرض حالة الربط دون كشف أي مفتاح
  getDebugConfig: () => request("/api/debug/config"),
  getHealth: () => request("/health"),
};

export default apiService;
