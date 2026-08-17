const BASE_URL = import.meta.env.VITE_API_URL || "https://sentrix-backend-qsnu.onrender.com";

// دالة مساعدة عامة للطلبات
async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Request Error at ${endpoint}:`, error);
    throw error;
  }
}

export const apiService = {
  // 1. Dashboard Stats
  getDashboardStats: () => request("/api/dashboard/stats"),

  // 2. Incidents (Intake & List)
  getIncidents: () => request("/api/incidents"),
  getIncidentById: (id) => request(`/api/incidents/${id}`),
  createIncident: (incidentData) =>
    request("/api/incidents", {
      method: "POST",
      body: JSON.stringify(incidentData),
    }),

  // رفع تقارير PDF وتحليلها
  uploadIncidentPDF: async (formData) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/incidents/upload-pdf`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData, // FormData لا يحتاج تحديد Content-Type يدوياً
    });
    if (!res.ok) throw new Error("Failed to upload and analyze PDF");
    return await res.json();
  },

  // 3. AI Analysis & Recommendations
  getAIAnalysis: (incidentId) => request(`/api/ai-analysis/${incidentId}`),
  getRecommendations: () => request("/api/recommendations"),
  getCRSIRecommendations: () => request("/api/crsi-recommendations"),
  getCRSIPosture: () => request("/api/crsi-assessment"),

  // 4. Archiving (P1 - P4 Verification & Retrieval)
  getArchivedIncidents: () => request("/api/archive"),
  verifyArchiveHash: (incidentId, sha256Hash) =>
    request(`/api/archive/verify/${incidentId}`, {
      method: "POST",
      body: JSON.stringify({ hash: sha256Hash }),
    }),

  // 5. Team Connection (Chat / Collab)
  getTeamMessages: () => request("/api/team/messages"),
  sendTeamMessage: (messageData) =>
    request("/api/team/messages", {
      method: "POST",
      body: JSON.stringify(messageData),
    }),
};
