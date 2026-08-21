import cv2
import numpy as np

POSE_CONNECTIONS = [
    (11, 12), # Left Shoulder -> Right Shoulder
    (11, 13), (13, 15), # Left Arm
    (12, 14), (14, 16), # Right Arm
    (11, 23), (12, 24), # Torso
    (23, 24), # Hips
    (23, 25), (25, 27), (27, 29), (29, 31), # Left Leg
    (24, 26), (26, 28), (28, 30), (30, 32)  # Right Leg
]

class SkeletonOverlayRenderer:
    """
    Renders synchronized biomechanical skeleton wireframe & live metric HUD onto video frames.
    """
    @staticmethod
    def draw_skeleton_on_frame(frame_bgr, landmarks_dict, hud_info=None):
        h, w, _ = frame_bgr.shape
        overlay = frame_bgr.copy()

        # Draw Bone Connections
        for p1_idx, p2_idx in POSE_CONNECTIONS:
            if p1_idx in landmarks_dict and p2_idx in landmarks_dict:
                lm1, lm2 = landmarks_dict[p1_idx], landmarks_dict[p2_idx]
                if lm1[3] > 0.4 and lm2[3] > 0.4:
                    pt1 = (int(lm1[0] * w), int(lm1[1] * h))
                    pt2 = (int(lm2[0] * w), int(lm2[1] * h))
                    cv2.line(overlay, pt1, pt2, (0, 255, 128), 3, cv2.LINE_AA)

        # Draw Joint Landmarks
        for idx, lm in landmarks_dict.items():
            if lm[3] > 0.4:
                center = (int(lm[0] * w), int(lm[1] * h))
                cv2.circle(overlay, center, 5, (0, 200, 255), -1, cv2.LINE_AA)
                cv2.circle(overlay, center, 7, (255, 255, 255), 1, cv2.LINE_AA)

        # Draw HUD Banner
        if hud_info:
            state_text = hud_info.get("state", "MEASURING")
            conf_text = hud_info.get("confidence", "91%")
            cv2.rectangle(overlay, (20, 20), (360, 110), (0, 0, 0), -1)
            cv2.rectangle(overlay, (20, 20), (360, 110), (0, 255, 128), 2)
            cv2.putText(overlay, "AI Biomechanical Verification", (35, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1, cv2.LINE_AA)
            cv2.putText(overlay, f"State: {state_text}", (35, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 128), 1, cv2.LINE_AA)
            cv2.putText(overlay, f"Confidence: {conf_text}", (35, 95), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 200, 255), 1, cv2.LINE_AA)

        # Alpha blend
        return cv2.addWeighted(overlay, 0.85, frame_bgr, 0.15, 0)
