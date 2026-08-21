-- Demo Seed Data: Users, Athletes, Assessments, Metrics, and Shortlists
-- Passwords hashed with standard dev bcrypt (password: "password123")
-- Hash: $2a$10$wE9Kq7z.sH0k3R2yU9oD4eQeN6vD3K2tZ4P8X1Y0O9U7T5S3R1Q2e

-- 1. Scout User
INSERT INTO users (id, full_name, phone, email, role, password_hash, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'Coach Vikram Rathore', '9876543210', 'scout.vikram@sai.gov.in', 'SCOUT', '$2a$10$wE9Kq7z.sH0k3R2yU9oD4eQeN6vD3K2tZ4P8X1Y0O9U7T5S3R1Q2e', true),
('00000000-0000-0000-0000-000000000002', 'Operator Ramesh Kumar', '9876543211', 'operator.ramesh@telangana.gov.in', 'OPERATOR', '$2a$10$wE9Kq7z.sH0k3R2yU9oD4eQeN6vD3K2tZ4P8X1Y0O9U7T5S3R1Q2e', true),
('00000000-0000-0000-0000-000000000003', 'Admin Priya Sharma', '9876543212', 'admin@sports-talent.gov.in', 'ADMIN', '$2a$10$wE9Kq7z.sH0k3R2yU9oD4eQeN6vD3K2tZ4P8X1Y0O9U7T5S3R1Q2e', true),
-- Athlete Users
('00000000-0000-0000-0000-000000000010', 'Arjun Netam', '9876543220', 'arjun@athlete.in', 'ATHLETE', '$2a$10$wE9Kq7z.sH0k3R2yU9oD4eQeN6vD3K2tZ4P8X1Y0O9U7T5S3R1Q2e', true),
('00000000-0000-0000-0000-000000000011', 'Priya Malik', '9876543221', 'priya@athlete.in', 'ATHLETE', '$2a$10$wE9Kq7z.sH0k3R2yU9oD4eQeN6vD3K2tZ4P8X1Y0O9U7T5S3R1Q2e', true),
('00000000-0000-0000-0000-000000000012', 'Birju Boro', '9876543222', 'birju@athlete.in', 'ATHLETE', '$2a$10$wE9Kq7z.sH0k3R2yU9oD4eQeN6vD3K2tZ4P8X1Y0O9U7T5S3R1Q2e', true)
ON CONFLICT (phone) DO NOTHING;

-- 2. Athlete Profiles
INSERT INTO athlete_profiles (id, user_id, dob, gender, state, district, pincode, height_cm, weight_kg, dominant_side, preferred_sport, school_or_centre, guardian_name, guardian_phone, guardian_consent) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', '2011-04-12', 'MALE', 'Telangana', 'Adilabad', '504001', 172.5, 61.0, 'RIGHT', 'ATHLETICS_SPRINT', 'Zilla Parishad High School, Adilabad', 'Shankar Netam', '9876543290', true),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000011', '2010-08-25', 'FEMALE', 'Haryana', 'Rohtak', '124001', 167.0, 56.5, 'RIGHT', 'FOOTBALL', 'Govt Model Sanskriti School, Rohtak', 'Sunita Malik', '9876543291', true),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012', '2012-01-15', 'MALE', 'Assam', 'Karbi Anglong', '782460', 158.0, 48.0, 'LEFT', 'ATHLETICS_SPRINT', 'Diphu Community Sports Centre', 'Rongbong Boro', '9876543292', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Arjun Completed Vertical Jump Session
INSERT INTO assessment_sessions (id, athlete_id, assessment_type_id, session_token, challenge_type, challenge_instruction, device_metadata, status, started_at, completed_at) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'tok_arjun_vjump_001', 'RAISE_LEFT_ARM', 'Raise your left hand high above your head for 2 seconds before starting the test.', '{"deviceModel": "Redmi Note 11", "cameraFps": 30.0}', 'COMPLETED', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 58 minutes')
ON CONFLICT (session_token) DO NOTHING;

INSERT INTO assessment_videos (id, assessment_session_id, raw_video_key, overlay_video_key, video_sha256, duration_sec, fps, resolution_w, resolution_h) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'videos/raw/arjun_jump_raw.mp4', 'videos/overlay/arjun_jump_skeleton.mp4', '7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730', 12.4, 30.0, 1280, 720)
ON CONFLICT (assessment_session_id) DO NOTHING;

INSERT INTO assessment_quality (id, assessment_session_id, framing_score, lighting_score, pose_visibility_ratio, challenge_verified, calibration_detected, overall_quality_score, validation_status) VALUES
('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 0.940, 0.910, 0.985, true, true, 0.945, 'VALID')
ON CONFLICT (assessment_session_id) DO NOTHING;

INSERT INTO assessment_metrics (id, assessment_session_id, metric_code, metric_value, metric_unit, cohort_percentile, metric_confidence) VALUES
(uuid_generate_v4(), '20000000-0000-0000-0000-000000000001', 'JUMP_HEIGHT_CM', 48.5, 'cm', 94.2, 0.920),
(uuid_generate_v4(), '20000000-0000-0000-0000-000000000001', 'FLIGHT_TIME_MS', 628.0, 'ms', 93.8, 0.940),
(uuid_generate_v4(), '20000000-0000-0000-0000-000000000001', 'TAKEOFF_VELOCITY_MS', 3.08, 'm/s', 94.0, 0.910);

INSERT INTO assessment_scores (id, assessment_session_id, potential_band, overall_score, confidence_score, scoring_version, strong_indicators, areas_for_verification, recommended_action) VALUES
('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'HIGH', 92.50, 0.895, 'v1.0.0-heuristic',
'[{"metric": "JUMP_HEIGHT_CM", "percentile": 94.2, "label": "Explosive Vertical Power", "valueDescription": "48.5 cm (Top 6% in Age 15 Male Cohort)"}]',
'[{"metric": "SPRINT_20M_SEC", "reason": "Requires high-speed 20m electronic timing gate verification", "suggestedTrialCheck": "Schedule 20m / 60m physical track trial"}]',
'District Physical Trial - Gachibowli Stadium, Hyderabad')
ON CONFLICT (assessment_session_id) DO NOTHING;

-- 4. Arjun Shortlist
INSERT INTO athlete_shortlists (id, athlete_id, assessment_session_id, status, priority_level) VALUES
('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'PENDING_REVIEW', 1)
ON CONFLICT (id) DO NOTHING;

-- 5. Physical Trials Catalog
INSERT INTO physical_trials (id, title, sport_id, venue_name, district, state, trial_date, coordinator_contact) VALUES
('70000000-0000-0000-0000-000000000001', 'Telangana State Grassroots Athletics Trial 2026', '11111111-1111-1111-1111-111111111111', 'Gachibowli Athletics Stadium, Hyderabad', 'Hyderabad', 'Telangana', '2026-09-15', 'Coach K. Srinivas (+91-9440123456)'),
('70000000-0000-0000-0000-000000000002', 'North India Junior Football Talent Selection', '22222222-2222-2222-2222-222222222222', 'Tau Devi Lal Stadium, Gurugram', 'Gurugram', 'Haryana', '2026-09-20', 'Coach Anil Sangwan (+91-9812345678)')
ON CONFLICT (id) DO NOTHING;
