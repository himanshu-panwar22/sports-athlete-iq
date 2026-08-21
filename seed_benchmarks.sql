-- Seed Data: Indian Adolescent Sports Benchmark Cohort Norms
-- Sports
INSERT INTO sports (id, code, name, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'ATHLETICS_SPRINT', 'Athletics (Sprints & Jumps)', true),
('22222222-2222-2222-2222-222222222222', 'FOOTBALL', 'Football (Soccer)', true),
('33333333-3333-3333-3333-333333333333', 'BASKETBALL', 'Basketball', true),
('44444444-4444-4444-4444-444444444444', 'GENERAL_FITNESS', 'General Athletic Fitness', true)
ON CONFLICT (code) DO NOTHING;

-- Assessment Types
INSERT INTO assessment_types (id, sport_id, code, name, description, instructions_json, min_confidence_threshold, is_active) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'VERTICAL_JUMP', 'Countermovement Vertical Jump', 'Measures explosive lower-body power and peak vertical displacement.', '{"overview": "Perform countermovement jump from side-view camera angle.", "rules": ["Feet stay in frame", "Dynamic gesture check before jump"], "calibrationRequired": true}', 0.75, true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 'SQUAT_TEST', 'Bodyweight Squat & Movement Quality', 'Measures functional knee/hip depth, trunk alignment, and bilateral symmetry.', '{"overview": "Perform 5 continuous squats facing lateral camera.", "rules": ["Thighs parallel to floor", "Keep heels flat"], "calibrationRequired": false}', 0.70, true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'SPRINT_20M', '20-Meter Sprint Acceleration', 'Measures sprint duration, top speed, and initial acceleration burst.', '{"overview": "Sprint across marked 20m cones.", "rules": ["Stationary start", "Full speed across 20m line"], "calibrationRequired": true}', 0.75, true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'BROAD_JUMP', 'Standing Broad Jump', 'Measures horizontal explosive takeoff power and landing balance.', '{"overview": "Jump forward from stationary line.", "rules": ["Toes behind line", "Stick the landing"], "calibrationRequired": true}', 0.75, true)
ON CONFLICT (code) DO NOTHING;

-- Benchmark Norms (p10, p25, p50, p75, p90, p95, p99)
-- 1. VERTICAL JUMP (cm) - Higher is better
INSERT INTO benchmark_cohorts (sport_code, metric_code, gender, min_age, max_age, p10, p25, p50, p75, p90, p95, p99, sample_source) VALUES
-- Boys
('ATHLETICS_SPRINT', 'JUMP_HEIGHT_CM', 'MALE', 10, 12, 18.0, 22.0, 26.5, 31.0, 35.5, 38.0, 42.0, 'SIH Adolescent Fitness Database v1'),
('ATHLETICS_SPRINT', 'JUMP_HEIGHT_CM', 'MALE', 13, 14, 24.0, 28.5, 33.0, 38.5, 43.5, 46.5, 52.0, 'SIH Adolescent Fitness Database v1'),
('ATHLETICS_SPRINT', 'JUMP_HEIGHT_CM', 'MALE', 15, 16, 28.0, 33.5, 39.0, 45.0, 50.5, 54.0, 60.5, 'SIH Adolescent Fitness Database v1'),
('ATHLETICS_SPRINT', 'JUMP_HEIGHT_CM', 'MALE', 17, 18, 32.0, 38.0, 44.5, 51.0, 57.0, 61.0, 68.0, 'SIH Adolescent Fitness Database v1'),
-- Girls
('ATHLETICS_SPRINT', 'JUMP_HEIGHT_CM', 'FEMALE', 10, 12, 16.0, 19.5, 23.5, 28.0, 32.0, 34.5, 38.0, 'SIH Adolescent Fitness Database v1'),
('ATHLETICS_SPRINT', 'JUMP_HEIGHT_CM', 'FEMALE', 13, 14, 20.0, 24.0, 28.5, 33.5, 38.0, 41.0, 46.0, 'SIH Adolescent Fitness Database v1'),
('ATHLETICS_SPRINT', 'JUMP_HEIGHT_CM', 'FEMALE', 15, 16, 22.0, 26.5, 31.5, 37.0, 42.0, 45.5, 50.0, 'SIH Adolescent Fitness Database v1'),
('ATHLETICS_SPRINT', 'JUMP_HEIGHT_CM', 'FEMALE', 17, 18, 24.0, 29.0, 34.0, 40.0, 45.0, 48.5, 54.0, 'SIH Adolescent Fitness Database v1');

-- 2. 20M SPRINT (seconds) - Lower is better (inverted percentiles mapped in calculation engine)
INSERT INTO benchmark_cohorts (sport_code, metric_code, gender, min_age, max_age, p10, p25, p50, p75, p90, p95, p99, sample_source) VALUES
-- Boys (Values in seconds: p99 is fastest/lowest time)
('ATHLETICS_SPRINT', 'SPRINT_20M_SEC', 'MALE', 10, 12, 4.40, 4.15, 3.85, 3.60, 3.40, 3.28, 3.12, 'SIH Adolescent Fitness Database v1'),
('ATHLETICS_SPRINT', 'SPRINT_20M_SEC', 'MALE', 13, 14, 3.95, 3.70, 3.45, 3.22, 3.05, 2.94, 2.82, 'SIH Adolescent Fitness Database v1'),
('ATHLETICS_SPRINT', 'SPRINT_20M_SEC', 'MALE', 15, 16, 3.65, 3.40, 3.18, 2.98, 2.82, 2.74, 2.62, 'SIH Adolescent Fitness Database v1'),
('ATHLETICS_SPRINT', 'SPRINT_20M_SEC', 'MALE', 17, 18, 3.45, 3.22, 3.00, 2.82, 2.68, 2.58, 2.48, 'SIH Adolescent Fitness Database v1'),
-- Girls
('ATHLETICS_SPRINT', 'SPRINT_20M_SEC', 'FEMALE', 10, 12, 4.55, 4.28, 3.98, 3.72, 3.52, 3.40, 3.24, 'SIH Adolescent Fitness Database v1'),
('ATHLETICS_SPRINT', 'SPRINT_20M_SEC', 'FEMALE', 13, 14, 4.15, 3.88, 3.62, 3.38, 3.20, 3.10, 2.95, 'SIH Adolescent Fitness Database v1'),
('ATHLETICS_SPRINT', 'SPRINT_20M_SEC', 'FEMALE', 15, 16, 3.90, 3.65, 3.40, 3.18, 3.02, 2.92, 2.80, 'SIH Adolescent Fitness Database v1'),
('ATHLETICS_SPRINT', 'SPRINT_20M_SEC', 'FEMALE', 17, 18, 3.75, 3.50, 3.28, 3.08, 2.92, 2.84, 2.72, 'SIH Adolescent Fitness Database v1');

-- 3. SQUAT SYMMETRY & DEPTH
INSERT INTO benchmark_cohorts (sport_code, metric_code, gender, min_age, max_age, p10, p25, p50, p75, p90, p95, p99, sample_source) VALUES
('GENERAL_FITNESS', 'SQUAT_SYMMETRY_PCT', 'MALE', 10, 18, 70.0, 78.0, 85.0, 92.0, 96.0, 98.0, 99.5, 'SIH Biomechanical Movement Norms'),
('GENERAL_FITNESS', 'SQUAT_SYMMETRY_PCT', 'FEMALE', 10, 18, 72.0, 80.0, 86.5, 93.0, 97.0, 98.5, 99.8, 'SIH Biomechanical Movement Norms'),
('GENERAL_FITNESS', 'SQUAT_DEPTH_DEG', 'MALE', 10, 18, 110.0, 100.0, 90.0, 80.0, 72.0, 68.0, 60.0, 'SIH Biomechanical Movement Norms'),
('GENERAL_FITNESS', 'SQUAT_DEPTH_DEG', 'FEMALE', 10, 18, 108.0, 98.0, 88.0, 78.0, 70.0, 65.0, 58.0, 'SIH Biomechanical Movement Norms');
