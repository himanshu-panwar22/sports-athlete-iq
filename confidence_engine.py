class ConfidenceEngine:
    """
    Confidence Formulation Engine:
    Confidence = 0.25 * VideoQuality + 0.35 * PoseVisibility + 0.20 * Calibration + 0.20 * KinematicAgreement
    """
    W_QUALITY = 0.25
    W_VISIBILITY = 0.35
    W_CALIBRATION = 0.20
    W_AGREEMENT = 0.20

    @classmethod
    def calculate_confidence(cls, video_quality_score, pose_visibility_ratio, calibration_confidence, kinematic_agreement=0.90):
        q = max(0.0, min(1.0, float(video_quality_score)))
        p = max(0.0, min(1.0, float(pose_visibility_ratio)))
        c = max(0.0, min(1.0, float(calibration_confidence)))
        a = max(0.0, min(1.0, float(kinematic_agreement)))

        confidence = (
            cls.W_QUALITY * q +
            cls.W_VISIBILITY * p +
            cls.W_CALIBRATION * c +
            cls.W_AGREEMENT * a
        )

        return float(round(confidence, 3))
