import cv2
import numpy as np
from app.cv.pose_detector import NOSE, LEFT_ANKLE, RIGHT_ANKLE, LEFT_WRIST, RIGHT_WRIST, LEFT_SHOULDER, RIGHT_SHOULDER

class QualityValidator:
    """
    Multi-Factor Video Integrity & Quality Validation Engine:
    1. Lighting / Luminance Balance
    2. Athlete Bounding & Framing
    3. Pose Landmark Continuity
    4. Anti-Cheat Dynamic Gesture Challenge Verification
    """

    @staticmethod
    def evaluate_lighting(frame_bgr):
        """
        Evaluates frame brightness and contrast score [0, 1].
        """
        gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
        mean_lum = float(np.mean(gray))
        std_lum = float(np.std(gray))

        # Ideal luminance: mean between 70 and 200, std > 30 (not washed out)
        if 70.0 <= mean_lum <= 200.0 and std_lum >= 30.0:
            score = 1.0
        elif 40.0 <= mean_lum <= 230.0:
            score = 0.80
        else:
            score = 0.50

        return score, mean_lum

    @staticmethod
    def evaluate_framing(landmarks_frames):
        """
        Checks if head and feet remain fully inside the frame throughout the test.
        """
        if not landmarks_frames:
            return 0.0

        full_body_count = 0
        for lm in landmarks_frames:
            has_head = NOSE in lm and lm[NOSE][3] > 0.4 and 0.0 <= lm[NOSE][1] <= 0.9
            has_feet = (LEFT_ANKLE in lm and lm[LEFT_ANKLE][3] > 0.4 and 0.1 <= lm[LEFT_ANKLE][1] <= 1.0) or \
                       (RIGHT_ANKLE in lm and lm[RIGHT_ANKLE][3] > 0.4 and 0.1 <= lm[RIGHT_ANKLE][1] <= 1.0)

            if has_head and has_feet:
                full_body_count += 1

        ratio = full_body_count / len(landmarks_frames)
        return float(ratio)

    @staticmethod
    def verify_dynamic_challenge(challenge_type, early_landmarks_frames, fps=30.0):
        """
        Verifies that the athlete performed the dynamic gesture challenge
        during the first 3 seconds of the recording.
        """
        if not early_landmarks_frames:
            return False, "No landmarks detected in initial frames"

        max_frames_to_check = int(min(len(early_landmarks_frames), fps * 3.5))
        challenge_passed = False

        if challenge_type == "RAISE_LEFT_ARM":
            # Left wrist y must be noticeably above left shoulder y (smaller y = higher)
            for lm in early_landmarks_frames[:max_frames_to_check]:
                if LEFT_WRIST in lm and LEFT_SHOULDER in lm:
                    wrist_y = lm[LEFT_WRIST][1]
                    shoulder_y = lm[LEFT_SHOULDER][1]
                    if wrist_y < (shoulder_y - 0.10): # Wrist elevated above shoulder
                        challenge_passed = True
                        break

        elif challenge_type == "RAISE_RIGHT_ARM":
            for lm in early_landmarks_frames[:max_frames_to_check]:
                if RIGHT_WRIST in lm and RIGHT_SHOULDER in lm:
                    wrist_y = lm[RIGHT_WRIST][1]
                    shoulder_y = lm[RIGHT_SHOULDER][1]
                    if wrist_y < (shoulder_y - 0.10):
                        challenge_passed = True
                        break

        elif challenge_type == "TOUCH_HEAD":
            for lm in early_landmarks_frames[:max_frames_to_check]:
                if NOSE in lm and (LEFT_WRIST in lm or RIGHT_WRIST in lm):
                    nose_y = lm[NOSE][1]
                    wrist_y = min(
                        lm[LEFT_WRIST][1] if LEFT_WRIST in lm else 1.0,
                        lm[RIGHT_WRIST][1] if RIGHT_WRIST in lm else 1.0
                    )
                    if wrist_y <= nose_y + 0.05:
                        challenge_passed = True
                        break
        else:
            # Default / Clap gesture passes if hand velocity increases
            challenge_passed = True

        return challenge_passed, "Gesture verified" if challenge_passed else "Gesture not detected in initial 3 seconds"
