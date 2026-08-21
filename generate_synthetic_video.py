import os
import math
import cv2
import numpy as np

def generate_synthetic_jump_video(output_path="backend/uploads/raw/synthetic_jump_sample.mp4", duration_sec=6.0, fps=30.0):
    """
    Generates a synthetic MP4 assessment video with an ArUco marker and an athlete silhouette
    performing a countermovement vertical jump with a dynamic gesture challenge.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    width, height = 1280, 720
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    total_frames = int(duration_sec * fps)
    cx, ground_y = 640, 560

    # Generate ArUco marker 150x150 px
    dictionary = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
    marker_img = cv2.aruco.generateImageMarker(dictionary, 0, 150)
    marker_bgr = cv2.cvtColor(marker_img, cv2.COLOR_GRAY2BGR)

    for frame_idx in range(total_frames):
        frame = np.full((height, width, 3), (18, 24, 38), dtype=np.uint8)

        # Draw Floor
        cv2.line(frame, (100, ground_y), (1180, ground_y), (45, 55, 72), 3)

        # Place ArUco Marker on Floor
        frame[ground_y - 170:ground_y - 20, 160:310] = marker_bgr
        cv2.putText(frame, "ArUco 15cm Scale Reference", (150, ground_y - 180), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (16, 185, 129), 2)

        # Calculate Kinematic Jump Trajectory
        progress = frame_idx / total_frames
        jump_offset = 0
        state_text = "STANDING BASELINE"

        if progress < 0.25:
            state_text = "DYNAMIC CHALLENGE: RAISE LEFT ARM"
        elif progress < 0.40:
            state_text = "COUNTERMOVEMENT PREPARATION DIP"
            dip_prog = (progress - 0.25) / 0.15
            jump_offset = int(math.sin(dip_prog * math.pi) * 35)
        elif progress < 0.70:
            state_text = "AIR FLIGHT TIME (h = 1/8 * g * dt^2 = 48.5 cm)"
            jump_prog = (progress - 0.40) / 0.30
            jump_offset = -int(math.sin(jump_prog * math.pi) * 160)
        else:
            state_text = "STABLE LANDING & LOCKOUT"
            jump_offset = 0

        # Draw Athlete Silhouette
        cy = ground_y - 220 + jump_offset
        # Head
        cv2.circle(frame, (cx, cy - 100), 30, (240, 244, 248), -1)
        # Torso
        cv2.line(frame, (cx, cy - 70), (cx, cy + 40), (240, 244, 248), 24)
        # Dynamic Left Arm Gesture in first 25%
        l_wrist_y = cy - 130 if progress < 0.25 else cy - 10
        cv2.line(frame, (cx - 30, cy - 50), (cx - 60, l_wrist_y), (240, 244, 248), 12)
        cv2.line(frame, (cx + 30, cy - 50), (cx + 60, cy - 10), (240, 244, 248), 12)
        # Legs
        cv2.line(frame, (cx - 20, cy + 40), (cx - 25, cy + 120), (240, 244, 248), 14)
        cv2.line(frame, (cx + 20, cy + 40), (cx + 25, cy + 120), (240, 244, 248), 14)
        cv2.line(frame, (cx - 25, cy + 120), (cx - 25, cy + 200), (240, 244, 248), 12)
        cv2.line(frame, (cx + 25, cy + 120), (cx + 25, cy + 200), (240, 244, 248), 12)

        # HUD Text
        cv2.putText(frame, "SPORTS TALENT AI - STANDARDIZED ASSESSMENT", (40, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(frame, f"State: {state_text}", (40, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (16, 185, 129), 2)

        out.write(frame)

    out.release()
    print(f"[GENERATED] Synthetic test video: {output_path} ({duration_sec}s @ {fps}fps)")

if __name__ == "__main__":
    generate_synthetic_jump_video()
