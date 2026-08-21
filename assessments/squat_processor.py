import numpy as np
from app.cv.pose_detector import (
    LEFT_HIP, LEFT_KNEE, LEFT_ANKLE,
    RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE,
    calculate_angle_3d
)

class SquatProcessor:
    """
    Squat & Functional Movement Biomechanical Assessment:
    - Knee Flexion Angle (Depth)
    - Bilateral Symmetry (%)
    - Repetition State Machine
    """
    def __init__(self, target_depth_deg=90.0, lockout_deg=160.0):
        self.target_depth_deg = float(target_depth_deg)
        self.lockout_deg = float(lockout_deg)

    def process_squat_trajectory(self, landmark_frames, fps=30.0):
        """
        landmark_frames: List of { idx: (x, y, z, vis) }
        Returns: { rep_count, min_knee_angle_deg, mean_symmetry_pct, metrics }
        """
        state = "STANDING" # STANDING -> DESCENDING -> BOTTOM -> ASCENDING -> COMPLETED_REP
        rep_count = 0
        min_knee_angle_recorded = 180.0
        symmetry_samples = []
        knee_angles_timeline = []

        for frame_idx, lm in enumerate(landmark_frames):
            if LEFT_HIP not in lm or LEFT_KNEE not in lm or LEFT_ANKLE not in lm:
                continue

            l_hip, l_knee, l_ankle = lm[LEFT_HIP][:3], lm[LEFT_KNEE][:3], lm[LEFT_ANKLE][:3]
            r_hip, r_knee, r_ankle = lm[RIGHT_HIP][:3], lm[RIGHT_KNEE][:3], lm[RIGHT_ANKLE][:3]

            left_knee_deg = calculate_angle_3d(l_hip, l_knee, l_ankle)
            right_knee_deg = calculate_angle_3d(r_hip, r_knee, r_ankle)
            avg_knee_deg = (left_knee_deg + right_knee_deg) / 2.0

            knee_angles_timeline.append(avg_knee_deg)
            if avg_knee_deg < min_knee_angle_recorded:
                min_knee_angle_recorded = avg_knee_deg

            # Bilateral Symmetry Index = 100 * (1 - |left - right| / 180)
            diff = abs(left_knee_deg - right_knee_deg)
            sym = max(0.0, min(100.0, 100.0 * (1.0 - diff / 180.0)))
            symmetry_samples.append(sym)

            # Repetition State Transition Logic
            if state == "STANDING":
                if avg_knee_deg < 140.0:
                    state = "DESCENDING"
            elif state == "DESCENDING":
                if avg_knee_deg <= self.target_depth_deg:
                    state = "BOTTOM"
            elif state == "BOTTOM":
                if avg_knee_deg > 110.0:
                    state = "ASCENDING"
            elif state == "ASCENDING":
                if avg_knee_deg >= self.lockout_deg:
                    rep_count += 1
                    state = "STANDING"

        mean_symmetry = float(np.mean(symmetry_samples)) if symmetry_samples else 85.0

        return {
            "rep_count": rep_count,
            "min_knee_angle_deg": float(min_knee_angle_recorded),
            "mean_symmetry_pct": float(mean_symmetry),
            "timeline_length": len(knee_angles_timeline)
        }
