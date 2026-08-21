import cv2
import numpy as np

class ScaleCalibrator:
    """
    Real-World Scale Calibration:
    Converts image pixel distances into physical centimeters using:
    1. ArUco Marker (Known physical width, e.g. 15.0 cm)
    2. Fallback: Athlete Standing Height Normalization
    """
    def __init__(self, aruco_dict_type=cv2.aruco.DICT_4X4_50, marker_actual_width_cm=15.0):
        self.aruco_dict_type = aruco_dict_type
        self.marker_actual_width_cm = float(marker_actual_width_cm)
        self.dictionary = cv2.aruco.getPredefinedDictionary(aruco_dict_type)
        self.parameters = cv2.aruco.DetectorParameters()
        self.detector = cv2.aruco.ArucoDetector(self.dictionary, self.parameters)

    def detect_aruco_scale(self, frame_bgr):
        """
        Detects ArUco marker in frame.
        Returns: (scale_cm_per_px, confidence, corners) or (None, 0.0, None)
        """
        gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
        corners, ids, rejected = self.detector.detectMarkers(gray)

        if ids is not None and len(corners) > 0:
            # Measure pixel width of marker corners (top-left to top-right)
            pts = corners[0][0] # 4 corner points
            top_width = np.linalg.norm(pts[1] - pts[0])
            bottom_width = np.linalg.norm(pts[2] - pts[3])
            avg_pixel_width = (top_width + bottom_width) / 2.0

            if avg_pixel_width > 5.0:
                scale_cm_per_px = self.marker_actual_width_cm / avg_pixel_width
                return scale_cm_per_px, 1.0, pts

        return None, 0.0, None

    def calculate_height_fallback_scale(self, athlete_height_cm, head_y, ankle_y, frame_height_px):
        """
        Fallback scale calculation based on athlete known standing height.
        """
        pixel_height = abs(ankle_y - head_y) * frame_height_px
        if pixel_height > 50.0 and athlete_height_cm > 80.0:
            scale_cm_per_px = float(athlete_height_cm) / pixel_height
            return scale_cm_per_px, 0.75 # Slightly lower confidence for fallback
        return 0.25, 0.50
