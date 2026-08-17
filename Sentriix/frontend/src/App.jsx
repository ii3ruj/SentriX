import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/incidents";
import IncidentDetail from "./pages/incidentDetail";
import NewIncident from "./pages/NewIncident";
import AIAnalysis from "./pages/AIAnalysis";
import CRSIAssessment from "./pages/CRSIAssessment";
import Recommendations from "./pages/Recommendations";
import CRSIRecommendations from "./pages/CRSIRecommendations";
import Archive from "./pages/Archive";
import TeamConnection from "./pages/TeamConnection";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            HOME / LOGIN
        ========================= */}

        <Route
          path="/"
          element={<Login />}
        />

        {/* =========================
            LOGIN
        ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* =========================
            DASHBOARD
        ========================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* =========================
            INCIDENTS
        ========================= */}

        <Route
          path="/incidents"
          element={<Incidents />}
        />

        {/* View specific incident */}

        <Route
          path="/incidents/:id"
          element={<IncidentDetail />}
        />

        {/* New Incident */}

        <Route
          path="/new-incident"
          element={<NewIncident />}
        />

        {/* =========================
            AI ANALYSIS
        ========================= */}

        <Route
          path="/ai-analysis"
          element={<AIAnalysis />}
        />

        <Route
          path="/ai-analysis/:id"
          element={<AIAnalysis />}
        />

        {/* =========================
            CRSI
        ========================= */}

        <Route
          path="/crsi-assessment"
          element={<CRSIAssessment />}
        />

        {/* =========================
            AI RISK SCORE
            RECOMMENDATIONS
        ========================= */}

        <Route
          path="/recommendations"
          element={<Recommendations />}
        />

        <Route
          path="/recommendations/:id"
          element={<Recommendations />}
        />

        {/* =========================
            CRSI RECOMMENDATIONS
        ========================= */}

        <Route
          path="/crsi-recommendations"
          element={<CRSIRecommendations />}
        />

        {/* =========================
            ARCHIVE
        ========================= */}

        <Route
          path="/archive"
          element={<Archive />}
        />

        {/* =========================
            TEAM CONNECTION
        ========================= */}

        <Route
          path="/team-connection"
          element={<TeamConnection />}
        />

        {/* =========================
            UNKNOWN ROUTE
        ========================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}
