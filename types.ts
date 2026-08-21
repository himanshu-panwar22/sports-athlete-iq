export type UserRole = "ATHLETE" | "SCOUT" | "OPERATOR" | "ADMIN" | "SAI_OFFICIAL";
export type GenderType = "MALE" | "FEMALE" | "OTHER";
export type SessionStatus = "INITIALIZED" | "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED" | "RETEST_REQUIRED";
export type ValidationStatus = "VALID" | "REVIEW_REQUIRED" | "INVALID";
export type PotentialBand = "EXCEPTIONAL" | "HIGH" | "ABOVE_AVERAGE" | "DEVELOPING" | "INSUFFICIENT_EVIDENCE";
export type ShortlistStatus = "PENDING_REVIEW" | "APPROVED_FOR_TRIAL" | "NEEDS_PHYSICAL_RETEST" | "REJECTED";
export type TrialStatus = "SCHEDULED" | "INVITED" | "ATTENDED_PASSED" | "ATTENDED_FAILED" | "NO_SHOW";
export type ChallengeType = "RAISE_LEFT_ARM" | "RAISE_RIGHT_ARM" | "TOUCH_HEAD" | "CLAP_HANDS";

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: UserRole;
  passwordHash?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AthleteProfile {
  id: string;
  userId: string;
  dob: string;
  gender: GenderType;
  state: string;
  district: string;
  pincode?: string;
  heightCm: number;
  weightKg: number;
  dominantSide: "LEFT" | "RIGHT" | "AMBIDEXTROUS";
  preferredSport: string;
  schoolOrCentre?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianConsent: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Sport {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface AssessmentType {
  id: string;
  sportId?: string;
  code: "VERTICAL_JUMP" | "SQUAT_TEST" | "SPRINT_20M" | "BROAD_JUMP" | "AGILITY_SHUTTLE";
  name: string;
  description: string;
  instructionsJson: {
    overview: string;
    cameraPosition: string;
    environment: string;
    rules: string[];
    calibrationRequired: boolean;
    estimatedSeconds: number;
  };
  minConfidenceThreshold: number;
  isActive: boolean;
}

export interface AssessmentSession {
  id: string;
  athleteId: string;
  assessmentTypeId: string;
  sessionToken: string;
  challengeType: ChallengeType;
  challengeInstruction: string;
  deviceMetadata?: {
    deviceModel?: string;
    os?: string;
    cameraFps?: number;
    sensorDataIncluded?: boolean;
  };
  status: SessionStatus;
  startedAt: string;
  completedAt?: string;
  assessmentType?: AssessmentType;
  athlete?: AthleteProfile;
}

export interface AssessmentVideo {
  id: string;
  assessmentSessionId: string;
  rawVideoKey: string;
  overlayVideoKey?: string;
  keyframeKeys?: string[];
  videoSha256: string;
  durationSec: number;
  fps: number;
  resolutionW: number;
  resolutionH: number;
  createdAt: string;
}

export interface AssessmentQuality {
  id: string;
  assessmentSessionId: string;
  framingScore: number;
  lightingScore: number;
  poseVisibilityRatio: number;
  challengeVerified: boolean;
  calibrationDetected: boolean;
  overallQualityScore: number;
  validationStatus: ValidationStatus;
  rejectionReasons?: string[];
  createdAt: string;
}

export interface AssessmentMetric {
  id: string;
  assessmentSessionId: string;
  metricCode: string;
  metricValue: number;
  metricUnit: string;
  cohortPercentile: number;
  metricConfidence: number;
  createdAt: string;
}

export interface StrongIndicator {
  metric: string;
  percentile: number;
  label: string;
  valueDescription: string;
}

export interface AreaForVerification {
  metric: string;
  reason: string;
  suggestedTrialCheck: string;
}

export interface AssessmentScore {
  id: string;
  assessmentSessionId: string;
  potentialBand: PotentialBand;
  overallScore: number;
  confidenceScore: number;
  scoringVersion: string;
  strongIndicators: StrongIndicator[];
  areasForVerification: AreaForVerification[];
  recommendedAction: string;
  createdAt: string;
}

export interface AthleteShortlist {
  id: string;
  athleteId: string;
  assessmentSessionId: string;
  status: ShortlistStatus;
  priorityLevel: number;
  createdAt: string;
  athlete?: AthleteProfile;
  assessmentSession?: AssessmentSession;
  assessmentScore?: AssessmentScore;
  scoutReviews?: ScoutReview[];
}

export interface ScoutReview {
  id: string;
  shortlistId: string;
  scoutId: string;
  decision: ShortlistStatus;
  reviewNotes: string;
  createdAt: string;
  scout?: User;
}

export interface PhysicalTrial {
  id: string;
  title: string;
  sportId?: string;
  venueName: string;
  district: string;
  state: string;
  trialDate: string;
  coordinatorContact: string;
  createdAt: string;
  sport?: Sport;
}

export interface TrialInvitation {
  id: string;
  trialId: string;
  athleteId: string;
  status: TrialStatus;
  invitationSentAt: string;
  trialResultNotes?: string;
  trial?: PhysicalTrial;
  athlete?: AthleteProfile;
}

export interface BenchmarkCohort {
  id: string;
  sportCode: string;
  metricCode: string;
  gender: GenderType;
  minAge: number;
  maxAge: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
  sampleSource: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entityName: string;
  entityId?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}
