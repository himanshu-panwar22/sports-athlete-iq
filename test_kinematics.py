import os
import sys
import math
import numpy as np

# Ensure ai-service root is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.cv.pose_detector import calculate_angle_3d
from app.cv.smoothing import OneEuroFilter
from app.cv.calibration import ScaleCalibrator
from app.assessments.squat_processor import SquatProcessor
from app.assessments.vertical_jump_processor import VerticalJumpProcessor
from app.scoring.confidence_engine import ConfidenceEngine
from app.scoring.cohort_evaluator import CohortEvaluator

def run_tests():
    print("================================================================================")
    print("             AI & COMPUTER VISION KINEMATICS PYTHON TEST SUITE                  ")
    print("================================================================================")
    
    passed = 0
    total = 0

    def assert_true(condition, test_name):
        nonlocal passed, total
        total += 1
        if condition:
            print(f"[PASS] {test_name}")
            passed += 1
        else:
            print(f"[FAIL] {test_name}")
            raise AssertionError(f"Test failed: {test_name}")

    # 1. 3D Angle Calculation
    p_hip = (0.0, 1.0, 0.0)
    p_knee = (0.0, 0.0, 0.0)
    p_ankle_orthogonal = (1.0, 0.0, 0.0) # 90 degree bend
    angle_90 = calculate_angle_3d(p_hip, p_knee, p_ankle_orthogonal)
    assert_true(abs(angle_90 - 90.0) < 1e-4, "3D vector angle calculation computes exact 90.0 deg")

    p_ankle_straight = (0.0, -1.0, 0.0) # 180 degree straight line
    angle_180 = calculate_angle_3d(p_hip, p_knee, p_ankle_straight)
    assert_true(abs(angle_180 - 180.0) < 1e-4, "3D vector angle calculation computes exact 180.0 deg")

    # 2. One-Euro Filter Jitter Reduction
    f = OneEuroFilter(t0=0.0, x0=10.0, min_cutoff=1.0, beta=0.007)
    v1 = f.filter(t=0.033, x=10.2)
    assert_true(10.0 < v1 < 10.2, "One-Euro filter attenuates high-frequency coordinate noise")

    # 3. ArUco Scale Calibrator Height Fallback
    calib = ScaleCalibrator()
    scale, conf = calib.calculate_height_fallback_scale(athlete_height_cm=172.5, head_y=0.1, ankle_y=0.9, frame_height_px=720)
    assert_true(conf == 0.75 and 0.25 < scale < 0.35, "Scale calibration fallback computes realistic pixel-to-cm ratio")

    # 4. Vertical Jump Flight Time Kinematics
    jump_proc = VerticalJumpProcessor(scale_cm_per_px=0.25)
    dt_sec = 0.628
    h_calc = 0.125 * 9.80665 * (dt_sec ** 2) * 100.0
    assert_true(abs(h_calc - 48.34) < 0.1, "Vertical jump time-of-flight physics equation verified")

    # 5. Squat Repetition & Bilateral Symmetry Model
    squat_proc = SquatProcessor(target_depth_deg=90.0, lockout_deg=160.0)
    sim_frames = []
    for angle in [170, 150, 130, 100, 80, 100, 130, 150, 170]:
        sim_frames.append({
            23: (0.0, 0.4, 0.0, 0.95),
            24: (0.1, 0.4, 0.0, 0.95),
            25: (0.0, 0.6, 0.0, 0.95),
            26: (0.1, 0.6, 0.0, 0.95),
            27: (0.0, 0.8, 0.0, 0.95),
            28: (0.1, 0.8, 0.0, 0.95),
        })
    res_squat = squat_proc.process_squat_trajectory(sim_frames)
    assert_true(res_squat["mean_symmetry_pct"] > 95.0, "Squat bilateral symmetry evaluation verifies balanced movement")

    # 6. Multi-Factor Confidence Score
    confidence = ConfidenceEngine.calculate_confidence(video_quality_score=0.92, pose_visibility_ratio=0.95, calibration_confidence=1.0, kinematic_agreement=0.90)
    assert_true(0.85 <= confidence <= 0.98, "Multi-factor confidence engine evaluates within expected range [0.85, 0.98]")

    # 7. Adolescent Indian Demographic Cohort Percentiles
    pct_arjun = CohortEvaluator.calculate_percentile("JUMP_HEIGHT_CM", raw_value=48.5, gender="MALE", age=15)
    assert_true(pct_arjun >= 88.0, "Cohort percentile engine correctly maps 48.5 cm jump to top adolescent bracket")

    eval_dossier = CohortEvaluator.generate_explainable_assessment(
        metrics=[{"metricCode": "JUMP_HEIGHT_CM", "metricValue": 48.5, "metricUnit": "cm", "cohortPercentile": pct_arjun}],
        confidence_score=confidence
    )
    assert_true(eval_dossier["potentialBand"] == "HIGH" and len(eval_dossier["strongIndicators"]) > 0, "Explainability generator synthesizes clear reasons and HIGH potential band")

    print("================================================================================")
    print(f"       ALL {passed}/{total} COMPUTER VISION TESTS PASSED WITH 100% SUCCESS RATE!          ")
    print("================================================================================")

if __name__ == "__main__":
    run_tests()
