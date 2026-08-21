-- PostgreSQL Database Schema for Sports Talent AI Platform (SIH Edition)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ATHLETE', 'SCOUT', 'OPERATOR', 'ADMIN', 'SAI_OFFICIAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('INITIALIZED', 'UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETEST_REQUIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE validation_status AS ENUM ('VALID', 'REVIEW_REQUIRED', 'INVALID');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE potential_band AS ENUM ('EXCEPTIONAL', 'HIGH', 'ABOVE_AVERAGE', 'DEVELOPING', 'INSUFFICIENT_EVIDENCE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE shortlist_status AS ENUM ('PENDING_REVIEW', 'APPROVED_FOR_TRIAL', 'NEEDS_PHYSICAL_RETEST', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE trial_status AS ENUM ('SCHEDULED', 'INVITED', 'ATTENDED_PASSED', 'ATTENDED_FAILED', 'NO_SHOW');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    role user_role NOT NULL DEFAULT 'ATHLETE',
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Athlete Profiles
CREATE TABLE IF NOT EXISTS athlete_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dob DATE NOT NULL,
    gender gender_type NOT NULL,
    state VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    pincode VARCHAR(10),
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    dominant_side VARCHAR(15) DEFAULT 'RIGHT',
    preferred_sport VARCHAR(50) NOT NULL,
    school_or_centre VARCHAR(150),
    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(15),
    guardian_consent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Sports Table
CREATE TABLE IF NOT EXISTS sports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. Assessment Types Catalog
CREATE TABLE IF NOT EXISTS assessment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sport_id UUID REFERENCES sports(id) ON DELETE SET NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    instructions_json JSONB NOT NULL,
    min_confidence_threshold NUMERIC(3,2) DEFAULT 0.70,
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. Assessment Sessions
CREATE TABLE IF NOT EXISTS assessment_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    assessment_type_id UUID NOT NULL REFERENCES assessment_types(id),
    session_token VARCHAR(64) UNIQUE NOT NULL,
    challenge_type VARCHAR(50) NOT NULL,
    challenge_instruction TEXT NOT NULL,
    device_metadata JSONB,
    status session_status DEFAULT 'INITIALIZED',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 6. Assessment Videos
CREATE TABLE IF NOT EXISTS assessment_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_session_id UUID UNIQUE NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    raw_video_key VARCHAR(255) NOT NULL,
    overlay_video_key VARCHAR(255),
    keyframe_keys JSONB,
    video_sha256 VARCHAR(64) NOT NULL,
    duration_sec NUMERIC(6,2),
    fps NUMERIC(5,1),
    resolution_w INT,
    resolution_h INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Assessment Quality
CREATE TABLE IF NOT EXISTS assessment_quality (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_session_id UUID UNIQUE NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    framing_score NUMERIC(4,3) NOT NULL,
    lighting_score NUMERIC(4,3) NOT NULL,
    pose_visibility_ratio NUMERIC(4,3) NOT NULL,
    challenge_verified BOOLEAN NOT NULL DEFAULT FALSE,
    calibration_detected BOOLEAN NOT NULL DEFAULT FALSE,
    overall_quality_score NUMERIC(4,3) NOT NULL,
    validation_status validation_status NOT NULL,
    rejection_reasons JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Assessment Metrics
CREATE TABLE IF NOT EXISTS assessment_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    metric_code VARCHAR(50) NOT NULL,
    metric_value NUMERIC(8,3) NOT NULL,
    metric_unit VARCHAR(20) NOT NULL,
    cohort_percentile NUMERIC(5,2),
    metric_confidence NUMERIC(4,3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Assessment Scores & Explainability
CREATE TABLE IF NOT EXISTS assessment_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_session_id UUID UNIQUE NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    potential_band potential_band NOT NULL,
    overall_score NUMERIC(5,2) NOT NULL,
    confidence_score NUMERIC(4,3) NOT NULL,
    scoring_version VARCHAR(30) NOT NULL DEFAULT 'v1.0.0-heuristic',
    strong_indicators JSONB NOT NULL,
    areas_for_verification JSONB NOT NULL,
    recommended_action VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Athlete Shortlists
CREATE TABLE IF NOT EXISTS athlete_shortlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    assessment_session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    status shortlist_status DEFAULT 'PENDING_REVIEW',
    priority_level INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Scout Reviews
CREATE TABLE IF NOT EXISTS scout_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shortlist_id UUID NOT NULL REFERENCES athlete_shortlists(id) ON DELETE CASCADE,
    scout_id UUID NOT NULL REFERENCES users(id),
    decision shortlist_status NOT NULL,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Physical Trials
CREATE TABLE IF NOT EXISTS physical_trials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    sport_id UUID REFERENCES sports(id),
    venue_name VARCHAR(150) NOT NULL,
    district VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    trial_date DATE NOT NULL,
    coordinator_contact VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Trial Invitations
CREATE TABLE IF NOT EXISTS trial_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trial_id UUID NOT NULL REFERENCES physical_trials(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    status trial_status DEFAULT 'INVITED',
    invitation_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trial_result_notes TEXT
);

-- 14. Benchmark Cohorts
CREATE TABLE IF NOT EXISTS benchmark_cohorts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sport_code VARCHAR(30) NOT NULL,
    metric_code VARCHAR(50) NOT NULL,
    gender gender_type NOT NULL,
    min_age INT NOT NULL,
    max_age INT NOT NULL,
    p10 NUMERIC(8,3) NOT NULL,
    p25 NUMERIC(8,3) NOT NULL,
    p50 NUMERIC(8,3) NOT NULL,
    p75 NUMERIC(8,3) NOT NULL,
    p90 NUMERIC(8,3) NOT NULL,
    p95 NUMERIC(8,3) NOT NULL,
    p99 NUMERIC(8,3) NOT NULL,
    sample_source VARCHAR(150) DEFAULT 'SIH Prototype Normative Dataset'
);

-- 15. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id UUID,
    ip_address VARCHAR(45),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for high performance queries
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_athletes_district_sport ON athlete_profiles(state, district, preferred_sport);
CREATE INDEX IF NOT EXISTS idx_sessions_athlete ON assessment_sessions(athlete_id, status);
CREATE INDEX IF NOT EXISTS idx_shortlists_status ON athlete_shortlists(status);
CREATE INDEX IF NOT EXISTS idx_metrics_session_code ON assessment_metrics(assessment_session_id, metric_code);
CREATE INDEX IF NOT EXISTS idx_benchmarks_lookup ON benchmark_cohorts(sport_code, metric_code, gender, min_age, max_age);
