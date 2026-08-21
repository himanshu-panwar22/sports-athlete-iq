import math
import numpy as np
from app.cv.pose_detector import (
    LEFT_ANKLE, RIGHT_ANKLE, LEFT_HIP, RIGHT_HIP, calculate_midpoint
)

class VerticalJumpProcessor:
    """
    Vertical Jump Kinematics Engine:
    - Time-of-Flight Physics: h = 1/8 * g * (delta_t)^2
    - Peak Optical Pelvis Apex Displacement
    - Initial Takeoff Velocity: v0 = 1/2 * g * delta_t
    """
    G = 9.80665 # Gravity constant m/s^2

    def __init__(self, scale_cm_per_px=0.25):
        self.scale_cm_per_px = scale_cm_per_px

    def process_jump_trajectory(self, landmark_frames, fps=30.0, scale_cm_per_px=None):
        """
        landmark_frames: List of { idx: (x, y, z, vis) }
        Returns: { flight_time_sec, jump_height_cm, takeoff_velocity_ms, takeoff_frame, landing_frame }
        """
        if scale_cm_per_px:
            self.scale_cm_per_px = scale_cm_per_px

        pelvis_y_series = []
        ankle_y_series = []

        for lm in landmark_frames:
            if LEFT_HIP in lm and RIGHT_HIP in lm:
                pelvis = calculate_midpoint(lm[LEFT_HIP], lm[RIGHT_HIP])
                pelvis_y_series.append(pelvis[1]) # Normalized y (smaller y = higher)
            else:
                pelvis_y_series.append(0.5)

            if LEFT_ANKLE in lm and RIGHT_ANKLE in lm:
                ankle = calculate_midpoint(lm[LEFT_ANKLE], lm[RIGHT_ANKLE])
                ankle_y_series.append(ankle[1])
            else:
                ankle_y_series.append(0.9)

        if len(pelvis_y_series) < 10:
            return None

        # Standing baseline (median of first 15 frames)
        baseline_y = np.median(pelvis_y_series[:15])
        apex_y = np.min(pelvis_y_series)
        apex_frame = int(np.argmin(pelvis_y_series))

        # Detect Takeoff (when pelvis starts rapid ascent below baseline - 0.05)
        takeoff_frame = apex_frame
        for f in range(apex_frame, -1, -1):
            if pelvis_y_series[f] >= baseline_y - 0.02:
                takeoff_frame = f
                break

        # Detect Landing (when pelvis returns to baseline)
        landing_frame = apex_frame
        for f in range(apex_frame, len(pelvis_y_series)):
            if pelvis_y_series[f] >= baseline_y - 0.02:
                landing_frame = f
                break

        flight_frames = max(1, landing_frame - takeoff_frame)
        flight_time_sec = flight_frames / float(fps)

        # 1. Physics Time-of-Flight Height (m -> cm)
        h_gravity_m = 0.125 * self.G * math.pow(flight_time_sec, 2)
        h_gravity_cm = h_gravity_m * 100.0

        # 2. Direct CV Displacement Height (cm)
        displacement_norm = max(0.0, baseline_y - apex_y)
        # Assuming typical 720p frame height (720 px)
        displacement_px = displacement_norm * 720.0
        h_cv_cm = displacement_px * self.scale_cm_per_px

        # Takeoff Velocity
        takeoff_velocity = 0.5 * self.G * flight_time_sec

        # Weighted Kinematic Fusion (70% Gravity-Time-of-Flight + 30% Calibrated Displacement)
        fused_jump_height_cm = (0.70 * h_gravity_cm) + (0.30 * h_cv_cm)

        return {
            "flight_time_ms": float(flight_time_sec * 1000.0),
            "jump_height_cm": float(fused_jump_height_cm),
            "h_gravity_cm": float(h_gravity_cm),
            "h_cv_cm": float(h_cv_cm),
            "takeoff_velocity_ms": float(takeoff_velocity),
            "takeoff_frame": takeoff_frame,
            "landing_frame": landing_frame,
            "apex_frame": apex_frame
        }
