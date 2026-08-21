import { ChallengeType } from "./types";

export const CHALLENGE_DEFINITIONS: Record<ChallengeType, { instruction: string; durationSec: number }> = {
  RAISE_LEFT_ARM: {
    instruction: "Raise your left hand high above your head for 2 seconds before starting the test.",
    durationSec: 2
  },
  RAISE_RIGHT_ARM: {
    instruction: "Raise your right hand high above your head for 2 seconds before starting the test.",
    durationSec: 2
  },
  TOUCH_HEAD: {
    instruction: "Place both hands on top of your head for 2 seconds before starting.",
    durationSec: 2
  },
  CLAP_HANDS: {
    instruction: "Clap your hands together in front of your chest once before starting.",
    durationSec: 2
  }
};

export const SPORT_SCORING_WEIGHTS: Record<string, Record<string, number>> = {
  ATHLETICS_SPRINT: {
    JUMP_HEIGHT_CM: 0.35,       // Explosive vertical power
    SPRINT_20M_SEC: 0.35,       // Top speed / Acceleration
    BROAD_JUMP_CM: 0.15,        // Horizontal power
    SQUAT_SYMMETRY_PCT: 0.15    // Movement quality & symmetry
  },
  FOOTBALL: {
    AGILITY_SHUTTLE_SEC: 0.30,  // Change of direction
    SPRINT_20M_SEC: 0.25,       // Acceleration
    SQUAT_SYMMETRY_PCT: 0.25,   // Lower body stability & symmetry
    JUMP_HEIGHT_CM: 0.20        // Explosive power
  },
  BASKETBALL: {
    JUMP_HEIGHT_CM: 0.45,       // Vertical leap
    AGILITY_SHUTTLE_SEC: 0.25,  // Agility
    SQUAT_SYMMETRY_PCT: 0.15,   // Landing mechanics
    SPRINT_20M_SEC: 0.15        // Transition speed
  },
  GENERAL_FITNESS: {
    JUMP_HEIGHT_CM: 0.30,
    SPRINT_20M_SEC: 0.25,
    SQUAT_DEPTH_DEG: 0.20,
    SQUAT_SYMMETRY_PCT: 0.15,
    BROAD_JUMP_CM: 0.10
  }
};

export const POTENTIAL_THRESHOLDS = {
  SHORTLIST_MIN_SCORE: 80,
  HUMAN_REVIEW_MIN_SCORE: 60,
  HIGH_CONFIDENCE_THRESHOLD: 0.80,
  MODERATE_CONFIDENCE_THRESHOLD: 0.60
};

export const CONFIDENCE_WEIGHTS = {
  VIDEO_QUALITY: 0.25,
  POSE_VISIBILITY: 0.35,
  CALIBRATION: 0.20,
  KINEMATIC_CONSISTENCY: 0.20
};

export const STANDARD_ASSESSMENT_CATALOG = [
  {
    code: "VERTICAL_JUMP",
    name: "Countermovement Vertical Jump",
    description: "Evaluates explosive lower-body power and vertical displacement.",
    instructionsJson: {
      overview: "Stand sideways to the camera, dip into a squat, and jump as high as possible.",
      cameraPosition: "Placed 3 to 4 meters away at hip level in landscape orientation.",
      environment: "Flat non-slip surface with clear vertical clearance.",
      rules: [
        "Full body and feet must remain in frame during the entire jump.",
        "Perform dynamic arm challenge before jumping.",
        "Land with both feet softly in the same location."
      ],
      calibrationRequired: true,
      estimatedSeconds: 15
    },
    minConfidenceThreshold: 0.75,
    isActive: true
  },
  {
    code: "SQUAT_TEST",
    name: "Bodyweight Squat & Movement Quality",
    description: "Evaluates lower-body functional strength, hip depth, knee flexion, and bilateral symmetry.",
    instructionsJson: {
      overview: "Perform 5 continuous bodyweight squats with arms extended forward.",
      cameraPosition: "Placed 2.5 to 3 meters away directly facing side-profile (lateral view).",
      environment: "Flat surface with adequate lighting.",
      rules: [
        "Thighs must reach parallel or below parallel (90 degrees).",
        "Keep torso upright and heels flat on ground.",
        "Perform continuous controlled repetitions."
      ],
      calibrationRequired: false,
      estimatedSeconds: 30
    },
    minConfidenceThreshold: 0.70,
    isActive: true
  },
  {
    code: "SPRINT_20M",
    name: "20-Meter Sprint Acceleration",
    description: "Measures initial acceleration, stride mechanics, and short-distance sprint velocity.",
    instructionsJson: {
      overview: "Sprint at maximum effort across a calibrated 20-meter marked distance.",
      cameraPosition: "Placed perpendicular to the midpoint (10m mark) capturing start and finish gates.",
      environment: "Straight 25-meter running track or flat field with marked cones.",
      rules: [
        "Stationary 3-point or standing start.",
        "Cross the 20-meter mark at full speed without slowing down early."
      ],
      calibrationRequired: true,
      estimatedSeconds: 20
    },
    minConfidenceThreshold: 0.75,
    isActive: true
  },
  {
    code: "BROAD_JUMP",
    name: "Standing Broad Jump",
    description: "Evaluates horizontal explosive power and landing stability.",
    instructionsJson: {
      overview: "Jump forward for maximum distance from a stationary standing position.",
      cameraPosition: "Lateral side view 3 to 4 meters away, capturing takeoff line and landing zone.",
      environment: "Flat non-slip surface with measuring tape or cones visible.",
      rules: [
        "Toes behind the takeoff line.",
        "Two-foot takeoff and two-foot landing without falling backwards."
      ],
      calibrationRequired: true,
      estimatedSeconds: 15
    },
    minConfidenceThreshold: 0.75,
    isActive: true
  }
];
