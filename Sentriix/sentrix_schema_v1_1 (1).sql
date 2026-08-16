-- ============================================================
-- SENTRIX - FINAL DATABASE SCHEMA
-- AI-Assisted Cybersecurity Decision Layer
-- PostgreSQL / Supabase
--
-- Version 1.1 - aligned with the AI agent layer output contract.
--
-- CRSI tables are intentionally NOT included.
-- AI training data remains external/offline (DataRobot).
-- Supabase stores runtime incidents and AI outputs.
-- ============================================================


-- ============================================================
-- 0. EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- 1. USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT,

    role VARCHAR(50) NOT NULL DEFAULT 'analyst',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_role_check
        CHECK (role IN ('admin', 'analyst', 'manager', 'viewer'))
);


-- ============================================================
-- 2. INCIDENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID REFERENCES users(id)
        ON DELETE SET NULL,

    title VARCHAR(255) NOT NULL,

    source VARCHAR(100) NOT NULL,

    incident_type VARCHAR(100) NOT NULL,

    source_ip VARCHAR(100),

    destination_ip VARCHAR(100),

    cve_id VARCHAR(100),

    description TEXT,

    -- Network / Isolation Forest feature data
    flow_features JSONB,

    asset_type VARCHAR(100),

    asset_criticality VARCHAR(50),

    -- How the incident entered SentriX
    input_method VARCHAR(30) NOT NULL DEFAULT 'manual',

    -- Optional original file information
    source_file_name VARCHAR(255),

    -- Exposure used by Risk Engine
    exposure VARCHAR(30),

    -- Vulnerability level used by Risk Engine
    vulnerability_level VARCHAR(30),

    -- Business impact used by Risk Engine
    business_impact VARCHAR(30),

    incident_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT incidents_input_method_check
        CHECK (
            input_method IN (
                'manual',
                'pdf',
                'server'
            )
        ),

    CONSTRAINT incidents_asset_criticality_check
        CHECK (
            asset_criticality IS NULL
            OR asset_criticality IN (
                'low',
                'medium',
                'high',
                'critical'
            )
        ),

    CONSTRAINT incidents_exposure_check
        CHECK (
            exposure IS NULL
            OR exposure IN (
                'internal',
                'dmz',
                'internet_facing'
            )
        ),

    CONSTRAINT incidents_vulnerability_check
        CHECK (
            vulnerability_level IS NULL
            OR vulnerability_level IN (
                'none',
                'low',
                'medium',
                'high',
                'critical'
            )
        ),

    CONSTRAINT incidents_business_impact_check
        CHECK (
            business_impact IS NULL
            OR business_impact IN (
                'low',
                'medium',
                'high',
                'critical'
            )
        )
);


-- ============================================================
-- 3. AI RESULTS
-- Isolation Forest output
--
-- NOTE: is_anomaly must remain NULL - never FALSE - when the
-- model did not run (manual entry without flow features).
-- FALSE asserts "checked and found normal"; NULL records
-- "never checked". The distinction is decisive in an audit.
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    incident_id UUID NOT NULL
        REFERENCES incidents(id)
        ON DELETE CASCADE,

    anomaly_score DOUBLE PRECISION,

    is_anomaly BOOLEAN,

    model_name VARCHAR(150) NOT NULL
        DEFAULT 'Isolation Forest',

    model_version VARCHAR(100),

    -- Stores prediction details:
    -- feature count, threshold, scoring method, etc.
    prediction_metadata JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ai_results_unique_incident
        UNIQUE (incident_id)
);


-- ============================================================
-- 4. RISK RESULTS
-- Risk Engine output
--
-- CHANGED in 1.1:
--   severity     accepts UPPERCASE values emitted by the engine
--   scoring_mode accepts ml_assisted / context_only
--   flow         added to distinguish full vs short path
-- ============================================================

CREATE TABLE IF NOT EXISTS risk_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    incident_id UUID NOT NULL
        REFERENCES incidents(id)
        ON DELETE CASCADE,

    risk_score DOUBLE PRECISION NOT NULL,

    severity VARCHAR(30) NOT NULL,

    -- Why the risk score was produced
    risk_factors JSONB,

    -- How the score was calculated
    scoring_mode VARCHAR(50) NOT NULL,

    -- Which execution path the incident took
    flow VARCHAR(20),

    -- P1 = highest priority
    priority VARCHAR(10),

    -- Response SLA in hours
    sla_hours INTEGER,

    -- Actual weights used by the Risk Engine
    weights_used JSONB,

    dynamic_threshold DOUBLE PRECISION,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT risk_severity_check
        CHECK (
            severity IN (
                'LOW',
                'MEDIUM',
                'HIGH',
                'CRITICAL'
            )
        ),

    CONSTRAINT risk_scoring_mode_check
        CHECK (
            scoring_mode IN (
                'ml_assisted',
                'context_only'
            )
        ),

    CONSTRAINT risk_flow_check
        CHECK (
            flow IS NULL
            OR flow IN (
                'full_path',
                'short_path'
            )
        ),

    CONSTRAINT risk_priority_check
        CHECK (
            priority IS NULL
            OR priority IN (
                'P1',
                'P2',
                'P3',
                'P4'
            )
        ),

    CONSTRAINT risk_score_range_check
        CHECK (
            risk_score >= 0
            AND risk_score <= 100
        ),

    CONSTRAINT risk_sla_check
        CHECK (
            sla_hours IS NULL
            OR sla_hours >= 0
        )
);


-- ============================================================
-- 5. THREAT ANALYSIS
-- MITRE ATT&CK + CIA Impact
--
-- CHANGED in 1.1:
--   mitre_tactics / mitre_techniques are JSONB arrays.
--   A single incident type maps to multiple tactics and
--   techniques; scalar columns silently dropped half the data.
--   Populated from a static intelligence table - never an LLM.
-- ============================================================

CREATE TABLE IF NOT EXISTS threat_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    incident_id UUID NOT NULL
        REFERENCES incidents(id)
        ON DELETE CASCADE,

    threat_type VARCHAR(150),

    -- Which intelligence profile matched
    matched_profile VARCHAR(100),

    -- TRUE when no profile matched and defaults were applied
    is_unmapped BOOLEAN NOT NULL DEFAULT FALSE,

    -- e.g. ["TA0040 - Impact", "TA0010 - Exfiltration"]
    mitre_tactics JSONB,

    -- e.g. ["T1486 - Data Encrypted for Impact"]
    mitre_techniques JSONB,

    -- CIA impact
    confidentiality_impact VARCHAR(30),

    integrity_impact VARCHAR(30),

    availability_impact VARCHAR(30),

    -- Version of the threat intelligence table used
    intel_version VARCHAR(50),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT threat_analysis_unique_incident
        UNIQUE (incident_id),

    CONSTRAINT confidentiality_impact_check
        CHECK (
            confidentiality_impact IS NULL
            OR confidentiality_impact IN (
                'low',
                'medium',
                'high'
            )
        ),

    CONSTRAINT integrity_impact_check
        CHECK (
            integrity_impact IS NULL
            OR integrity_impact IN (
                'low',
                'medium',
                'high'
            )
        ),

    CONSTRAINT availability_impact_check
        CHECK (
            availability_impact IS NULL
            OR availability_impact IN (
                'low',
                'medium',
                'high'
            )
        )
);


-- ============================================================
-- 6. AI NARRATIVES
-- AI Analysis Summary + Key Findings
--
-- CHANGED in 1.1:
--   narrative_source added - the LLM layer is optional and the
--   report is complete without it. This records whether the
--   narrative came from the model, failed, or was skipped on
--   the short path.
--
-- Kept in a separate table because LLM output is
-- non-deterministic and may be regenerated; it must never be
-- mixed with the deterministic scoring results.
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_narratives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    incident_id UUID NOT NULL
        REFERENCES incidents(id)
        ON DELETE CASCADE,

    analysis_id VARCHAR(100),

    model_used VARCHAR(150),

    analysis_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    data_sources JSONB,

    analysis_summary TEXT,

    key_findings JSONB,

    prompt_version VARCHAR(100),

    narrative_source VARCHAR(20),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ai_narratives_unique_incident
        UNIQUE (incident_id),

    CONSTRAINT narrative_source_check
        CHECK (
            narrative_source IS NULL
            OR narrative_source IN (
                'llm',
                'unavailable',
                'skipped'
            )
        )
);


-- ============================================================
-- 7. PLAYBOOKS
-- Trusted response procedures
-- ============================================================

CREATE TABLE IF NOT EXISTS playbooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(255) NOT NULL,

    incident_type VARCHAR(100) NOT NULL,

    minimum_severity VARCHAR(30),

    description TEXT,

    -- General playbook metadata
    actions JSONB,

    source_reference TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT playbook_severity_check
        CHECK (
            minimum_severity IS NULL
            OR minimum_severity IN (
                'LOW',
                'MEDIUM',
                'HIGH',
                'CRITICAL'
            )
        )
);


-- ============================================================
-- 8. INCIDENT RECOMMENDATIONS
-- One row per recommended response action.
--
-- Stored individually rather than as a single array so the
-- analyst can mark each action complete on its own, which
-- later enables response-effectiveness measurement.
-- ============================================================

CREATE TABLE IF NOT EXISTS incident_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    incident_id UUID NOT NULL
        REFERENCES incidents(id)
        ON DELETE CASCADE,

    playbook_id UUID
        REFERENCES playbooks(id)
        ON DELETE SET NULL,

    recommendation_reason TEXT,

    action_title VARCHAR(255) NOT NULL,

    action_description TEXT,

    -- immediate = incident response, organizational = posture
    action_scope VARCHAR(30) NOT NULL DEFAULT 'immediate',

    -- Execution order within the playbook
    action_order INTEGER,

    -- TRUE when no playbook matched and default rules applied
    is_fallback BOOLEAN NOT NULL DEFAULT FALSE,

    priority VARCHAR(30),

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    completed_at TIMESTAMPTZ,

    completed_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT recommendation_scope_check
        CHECK (
            action_scope IN (
                'immediate',
                'organizational'
            )
        ),

    CONSTRAINT recommendation_priority_check
        CHECK (
            priority IS NULL
            OR priority IN (
                'LOW',
                'MEDIUM',
                'HIGH',
                'CRITICAL'
            )
        ),

    CONSTRAINT recommendation_status_check
        CHECK (
            status IN (
                'pending',
                'in_progress',
                'completed',
                'skipped'
            )
        )
);


-- ============================================================
-- 9. SECURITY CRITERIA
-- Reference framework / scoring domains
--
-- This is NOT CRSI.
-- It supports the Organizational Security Score.
-- ============================================================

CREATE TABLE IF NOT EXISTS security_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    domain_key VARCHAR(100) NOT NULL UNIQUE,

    domain_name VARCHAR(150) NOT NULL,

    framework VARCHAR(100),

    control_reference VARCHAR(150),

    description TEXT,

    weight DOUBLE PRECISION NOT NULL DEFAULT 0,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT security_criteria_weight_check
        CHECK (
            weight >= 0
            AND weight <= 1
        )
);


-- ============================================================
-- 10. ORGANIZATIONAL SECURITY SCORES
-- Overall company Security Score
--
-- NOTE: the score should be computed over a bounded window
-- (period_start .. period_end, e.g. the last 90 days).
-- An unbounded history penalises a two-year-old incident
-- exactly as much as one from yesterday.
-- ============================================================

CREATE TABLE IF NOT EXISTS organizational_security_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    score DOUBLE PRECISION NOT NULL,

    period_start DATE NOT NULL,

    period_end DATE NOT NULL,

    maturity_level VARCHAR(50),

    -- Number of incidents considered
    incident_count INTEGER NOT NULL DEFAULT 0,

    -- Optional previous score for tracking changes
    previous_score DOUBLE PRECISION,

    -- Stores calculation metadata/version
    calculation_metadata JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT organizational_score_range_check
        CHECK (
            score >= 0
            AND score <= 100
        ),

    CONSTRAINT organizational_previous_score_check
        CHECK (
            previous_score IS NULL
            OR (
                previous_score >= 0
                AND previous_score <= 100
            )
        ),

    CONSTRAINT organizational_period_check
        CHECK (
            period_end >= period_start
        )
);


-- ============================================================
-- 11. ORGANIZATIONAL SCORE DETAILS
-- Score Breakdown
-- ============================================================

CREATE TABLE IF NOT EXISTS organizational_score_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    security_score_id UUID NOT NULL
        REFERENCES organizational_security_scores(id)
        ON DELETE CASCADE,

    criterion_id UUID
        REFERENCES security_criteria(id)
        ON DELETE SET NULL,

    domain_key VARCHAR(100) NOT NULL,

    domain_name VARCHAR(150) NOT NULL,

    score DOUBLE PRECISION NOT NULL,

    weight DOUBLE PRECISION NOT NULL,

    contribution DOUBLE PRECISION,

    -- Number of previous/current incidents affecting this domain
    incident_hits INTEGER NOT NULL DEFAULT 0,

    -- Indicates weak area
    is_weak BOOLEAN NOT NULL DEFAULT FALSE,

    improvement_recommendation TEXT,

    control_reference VARCHAR(150),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT score_detail_score_check
        CHECK (
            score >= 0
            AND score <= 100
        ),

    CONSTRAINT score_detail_weight_check
        CHECK (
            weight >= 0
            AND weight <= 1
        ),

    CONSTRAINT score_detail_incident_hits_check
        CHECK (
            incident_hits >= 0
        )
);


-- ============================================================
-- 12. INCIDENT REPORTS
-- Generated JSON report + PDF information
-- ============================================================

CREATE TABLE IF NOT EXISTS incident_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    incident_id UUID NOT NULL
        REFERENCES incidents(id)
        ON DELETE CASCADE,

    report_json JSONB NOT NULL,

    pdf_path TEXT,

    report_version VARCHAR(100),

    generated_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 13. ARCHIVES
-- Immutable archive information.
--
-- report_snapshot holds a FROZEN copy of the full report,
-- not references. If scoring weights are re-tuned or asset
-- data is edited later, a previously issued report must still
-- read exactly as it did on its issue date.
-- ============================================================

CREATE TABLE IF NOT EXISTS archives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    report_id UUID NOT NULL
        REFERENCES incident_reports(id)
        ON DELETE CASCADE,

    -- Full frozen report snapshot
    report_snapshot JSONB NOT NULL,

    storage_path TEXT,

    pdf_path TEXT,

    archive_period VARCHAR(50),

    sha256_hash VARCHAR(64),

    archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 14. INDEXES
-- ============================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);


-- Incidents
CREATE INDEX IF NOT EXISTS idx_incidents_user
ON incidents(user_id);

CREATE INDEX IF NOT EXISTS idx_incidents_type
ON incidents(incident_type);

CREATE INDEX IF NOT EXISTS idx_incidents_created
ON incidents(created_at);

CREATE INDEX IF NOT EXISTS idx_incidents_org_created
ON incidents(created_at, incident_type);


-- AI
CREATE INDEX IF NOT EXISTS idx_ai_results_incident
ON ai_results(incident_id);

CREATE INDEX IF NOT EXISTS idx_ai_results_created
ON ai_results(created_at);


-- Risk
CREATE INDEX IF NOT EXISTS idx_risk_results_incident
ON risk_results(incident_id);

CREATE INDEX IF NOT EXISTS idx_risk_results_severity
ON risk_results(severity);

CREATE INDEX IF NOT EXISTS idx_risk_results_created
ON risk_results(created_at);


-- Threat
CREATE INDEX IF NOT EXISTS idx_threat_analysis_incident
ON threat_analysis(incident_id);

CREATE INDEX IF NOT EXISTS idx_threat_analysis_type
ON threat_analysis(threat_type);


-- AI Narrative
CREATE INDEX IF NOT EXISTS idx_ai_narratives_incident
ON ai_narratives(incident_id);


-- Recommendations
CREATE INDEX IF NOT EXISTS idx_incident_recommendations_incident
ON incident_recommendations(incident_id);

CREATE INDEX IF NOT EXISTS idx_incident_recommendations_status
ON incident_recommendations(status);


-- Security Score
CREATE INDEX IF NOT EXISTS idx_security_scores_period
ON organizational_security_scores(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_score_details_score
ON organizational_score_details(security_score_id);


-- Reports
CREATE INDEX IF NOT EXISTS idx_incident_reports_incident
ON incident_reports(incident_id);


-- Archives
CREATE INDEX IF NOT EXISTS idx_archives_report
ON archives(report_id);

CREATE INDEX IF NOT EXISTS idx_archives_period
ON archives(archive_period);


-- ============================================================
-- 15. VIEW
-- Complete Incident Details for Web Frontend
-- ============================================================

CREATE OR REPLACE VIEW v_incident_full AS
SELECT

    -- Incident
    i.id AS incident_id,
    i.title,
    i.source,
    i.incident_type,
    i.source_ip,
    i.destination_ip,
    i.cve_id,
    i.description,
    i.asset_type,
    i.asset_criticality,
    i.input_method,
    i.source_file_name,
    i.exposure,
    i.vulnerability_level,
    i.business_impact,
    i.incident_time,
    i.created_at AS incident_created_at,

    -- AI
    ai.id AS ai_result_id,
    ai.anomaly_score,
    ai.is_anomaly,
    ai.model_name,
    ai.model_version,
    ai.prediction_metadata,

    -- Risk
    rr.id AS risk_result_id,
    rr.risk_score,
    rr.severity,
    rr.risk_factors,
    rr.scoring_mode,
    rr.flow,
    rr.priority,
    rr.sla_hours,
    rr.weights_used,
    rr.dynamic_threshold,

    -- Threat
    ta.threat_type,
    ta.matched_profile,
    ta.is_unmapped,
    ta.mitre_tactics,
    ta.mitre_techniques,
    ta.confidentiality_impact,
    ta.integrity_impact,
    ta.availability_impact,
    ta.intel_version,

    -- AI Narrative
    an.analysis_id,
    an.model_used AS narrative_model,
    an.analysis_time,
    an.data_sources,
    an.analysis_summary,
    an.key_findings,
    an.prompt_version,
    an.narrative_source

FROM incidents i

LEFT JOIN ai_results ai
    ON ai.incident_id = i.id

LEFT JOIN risk_results rr
    ON rr.incident_id = i.id

LEFT JOIN threat_analysis ta
    ON ta.incident_id = i.id

LEFT JOIN ai_narratives an
    ON an.incident_id = i.id;


-- ============================================================
-- 16. INITIAL SECURITY CRITERIA
-- Used by Organizational Security Score
--
-- NOTE: control references are architectural guidance. They
-- must be reviewed against the current published editions of
-- NIST CSF, ISO 27001 and NCA ECC before appearing in any
-- formal report.
--
-- Weights sum to 1.00. Verify after any edit:
--   SELECT ROUND(SUM(weight)::numeric, 4) FROM security_criteria;
-- ============================================================

INSERT INTO security_criteria
(
    domain_key,
    domain_name,
    framework,
    control_reference,
    description,
    weight
)
VALUES

(
    'identity_access',
    'Identify & Access',
    'NIST / ISO / NCA',
    'NIST CSF - Protect',
    'Identity, access control and authentication security.',
    0.18
),

(
    'network_security',
    'Network Security',
    'NIST / ISO / NCA',
    'NIST CSF - Protect',
    'Network protection and network security controls.',
    0.16
),

(
    'endpoint_security',
    'Endpoint Security',
    'NIST / ISO / NCA',
    'NIST CSF - Protect',
    'Endpoint protection and endpoint security controls.',
    0.16
),

(
    'vulnerability_management',
    'Vulnerability Management',
    'NIST / ISO / NCA',
    'NIST CSF - Identify',
    'Vulnerability identification and remediation.',
    0.14
),

(
    'detect_respond',
    'Detect & Respond',
    'NIST / ISO / NCA',
    'NIST CSF - Detect / Respond',
    'Detection, incident response and monitoring capabilities.',
    0.16
),

(
    'backup_recovery',
    'Backup & Recovery',
    'NIST / ISO / NCA',
    'NIST CSF - Recover',
    'Backup, recovery and business continuity capabilities.',
    0.12
),

(
    'security_awareness',
    'Security Awareness',
    'NIST / ISO / NCA',
    'NIST CSF - Protect',
    'Security awareness and human-related security controls.',
    0.08
)

ON CONFLICT (domain_key)
DO UPDATE SET
    domain_name = EXCLUDED.domain_name,
    framework = EXCLUDED.framework,
    control_reference = EXCLUDED.control_reference,
    description = EXCLUDED.description,
    weight = EXCLUDED.weight;


-- ============================================================
-- END OF SENTRIX FINAL SCHEMA
-- ============================================================
