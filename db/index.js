const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

class DatabaseService {
  constructor() {
    this.users = [];
    this.athleteProfiles = [];
    this.scoutProfiles = [];
    this.sports = [];
    this.assessmentTypes = [];
    this.assessmentSessions = [];
    this.assessmentVideos = [];
    this.assessmentQuality = [];
    this.assessmentMetrics = [];
    this.assessmentScores = [];
    this.athleteShortlists = [];
    this.scoutReviews = [];
    this.physicalTrials = [];
    this.trialInvitations = [];
    this.benchmarkCohorts = [];
    this.auditLogs = [];

    this._seedInitialData();
  }

  _seedInitialData() {
    const passwordHash = bcrypt.hashSync("password123", 10);

    // 1. Users
    const scoutUser = {
      id: "00000000-0000-0000-0000-000000000001",
      fullName: "Coach Vikram Rathore",
      phone: "9876543210",
      email: "scout.vikram@sai.gov.in",
      role: "SCOUT",
      passwordHash,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const scoutProfile = {
      id: "50000000-0000-0000-0000-000000000001",
      userId: scoutUser.id,
      organization: "Sports Authority of India (SAI)",
      badgeId: "SAI-SCOUT-7842",
      designation: "Senior Talent Scout & Track Coach",
      assignedState: "Telangana",
      assignedDistricts: ["Adilabad", "Hyderabad", "Warangal", "Nizamabad"],
      specialization: "ATHLETICS_SPRINT",
      createdAt: new Date().toISOString()
    };
    this.scoutProfiles.push(scoutProfile);

    const operatorUser = {
      id: "00000000-0000-0000-0000-000000000002",
      fullName: "Operator Ramesh Kumar",
      phone: "9876543211",
      email: "operator.ramesh@telangana.gov.in",
      role: "OPERATOR",
      passwordHash,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const adminUser = {
      id: "00000000-0000-0000-0000-000000000003",
      fullName: "Admin Priya Sharma",
      phone: "9876543212",
      email: "admin@sports-talent.gov.in",
      role: "ADMIN",
      passwordHash,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const arjunUser = {
      id: "00000000-0000-0000-0000-000000000010",
      fullName: "Arjun Netam",
      phone: "9876543220",
      email: "arjun@athlete.in",
      role: "ATHLETE",
      passwordHash,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const priyaUser = {
      id: "00000000-0000-0000-0000-000000000011",
      fullName: "Priya Malik",
      phone: "9876543221",
      email: "priya@athlete.in",
      role: "ATHLETE",
      passwordHash,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const birjuUser = {
      id: "00000000-0000-0000-0000-000000000012",
      fullName: "Birju Boro",
      phone: "9876543222",
      email: "birju@athlete.in",
      role: "ATHLETE",
      passwordHash,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.push(scoutUser, operatorUser, adminUser, arjunUser, priyaUser, birjuUser);

    // 2. Athlete Profiles
    const arjunProfile = {
      id: "10000000-0000-0000-0000-000000000001",
      userId: arjunUser.id,
      dob: "2011-04-12",
      gender: "MALE",
      state: "Telangana",
      district: "Adilabad",
      pincode: "504001",
      heightCm: 172.5,
      weightKg: 61.0,
      dominantSide: "RIGHT",
      preferredSport: "ATHLETICS_SPRINT",
      schoolOrCentre: "Zilla Parishad High School, Adilabad",
      guardianName: "Shankar Netam",
      guardianPhone: "9876543290",
      guardianConsent: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const priyaProfile = {
      id: "10000000-0000-0000-0000-000000000002",
      userId: priyaUser.id,
      dob: "2010-08-25",
      gender: "FEMALE",
      state: "Haryana",
      district: "Rohtak",
      pincode: "124001",
      heightCm: 167.0,
      weightKg: 56.5,
      dominantSide: "RIGHT",
      preferredSport: "FOOTBALL",
      schoolOrCentre: "Govt Model Sanskriti School, Rohtak",
      guardianName: "Sunita Malik",
      guardianPhone: "9876543291",
      guardianConsent: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const birjuProfile = {
      id: "10000000-0000-0000-0000-000000000003",
      userId: birjuUser.id,
      dob: "2012-01-15",
      gender: "MALE",
      state: "Assam",
      district: "Karbi Anglong",
      pincode: "782460",
      heightCm: 158.0,
      weightKg: 48.0,
      dominantSide: "LEFT",
      preferredSport: "ATHLETICS_SPRINT",
      schoolOrCentre: "Diphu Community Sports Centre",
      guardianName: "Rongbong Boro",
      guardianPhone: "9876543292",
      guardianConsent: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.athleteProfiles.push(arjunProfile, priyaProfile, birjuProfile);

    // 3. Sports Catalog
    this.sports.push(
      { id: "11111111-1111-1111-1111-111111111111", code: "ATHLETICS_SPRINT", name: "Athletics (Sprints & Jumps)", isActive: true },
      { id: "22222222-2222-2222-2222-222222222222", code: "FOOTBALL", name: "Football (Soccer)", isActive: true },
      { id: "33333333-3333-3333-3333-333333333333", code: "BASKETBALL", name: "Basketball", isActive: true },
      { id: "44444444-4444-4444-4444-444444444444", code: "GENERAL_FITNESS", name: "General Athletic Fitness", isActive: true }
    );

    // 4. Assessment Types
    this.assessmentTypes.push(
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        sportId: "11111111-1111-1111-1111-111111111111",
        code: "VERTICAL_JUMP",
        name: "Countermovement Vertical Jump",
        description: "Measures explosive lower-body power, takeoff velocity, and peak vertical displacement.",
        instructionsJson: {
          overview: "Stand sideways to the camera, dip, and jump vertically with maximum effort.",
          cameraPosition: "Placed 3 to 4 meters away at hip level in landscape view.",
          rules: ["Full body remains in frame", "Perform dynamic challenge before jump", "Soft controlled landing"],
          calibrationRequired: true,
          estimatedSeconds: 15
        },
        minConfidenceThreshold: 0.75,
        isActive: true
      },
      {
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        sportId: "44444444-4444-4444-4444-444444444444",
        code: "SQUAT_TEST",
        name: "Bodyweight Squat & Movement Quality",
        description: "Measures functional knee/hip flexion depth, trunk alignment, and bilateral symmetry.",
        instructionsJson: {
          overview: "Perform 5 continuous bodyweight squats with arms extended forward.",
          cameraPosition: "Placed 2.5 to 3 meters away in lateral side view.",
          rules: ["Thighs reach parallel (90 deg)", "Keep heels flat", "Continuous rhythm"],
          calibrationRequired: false,
          estimatedSeconds: 30
        },
        minConfidenceThreshold: 0.70,
        isActive: true
      },
      {
        id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        sportId: "11111111-1111-1111-1111-111111111111",
        code: "SPRINT_20M",
        name: "20-Meter Sprint Acceleration",
        description: "Measures sprint duration, top speed, and initial acceleration burst.",
        instructionsJson: {
          overview: "Sprint at full effort across marked 20m cones.",
          cameraPosition: "Midpoint perpendicular view capturing 0m start and 20m finish lines.",
          rules: ["Stationary start", "Run through the finish line"],
          calibrationRequired: true,
          estimatedSeconds: 20
        },
        minConfidenceThreshold: 0.75,
        isActive: true
      },
      {
        id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
        sportId: "11111111-1111-1111-1111-111111111111",
        code: "BROAD_JUMP",
        name: "Standing Broad Jump",
        description: "Measures horizontal explosive takeoff power and landing stabilization.",
        instructionsJson: {
          overview: "Jump forward for maximum distance from a stationary start line.",
          cameraPosition: "Sideways lateral view capturing takeoff line and landing zone.",
          rules: ["Toes behind start line", "Two-foot simultaneous landing", "Maintain balance"],
          calibrationRequired: true,
          estimatedSeconds: 15
        },
        minConfidenceThreshold: 0.75,
        isActive: true
      }
    );

    // 5. Arjun Completed Assessment
    const arjunSessionId = "20000000-0000-0000-0000-000000000001";
    this.assessmentSessions.push({
      id: arjunSessionId,
      athleteId: arjunProfile.id,
      assessmentTypeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      sessionToken: "tok_arjun_vjump_001",
      challengeType: "RAISE_LEFT_ARM",
      challengeInstruction: "Raise your left hand high above your head for 2 seconds before starting the test.",
      deviceMetadata: { deviceModel: "Redmi Note 11", cameraFps: 30.0 },
      status: "COMPLETED",
      startedAt: new Date(Date.now() - 7200000).toISOString(),
      completedAt: new Date(Date.now() - 7080000).toISOString()
    });

    this.assessmentVideos.push({
      id: "30000000-0000-0000-0000-000000000001",
      assessmentSessionId: arjunSessionId,
      rawVideoKey: "raw/arjun_jump_raw.mp4",
      overlayVideoKey: "overlay/arjun_jump_skeleton.mp4",
      videoSha256: "7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730",
      durationSec: 12.4,
      fps: 30.0,
      resolutionW: 1280,
      resolutionH: 720,
      createdAt: new Date(Date.now() - 7100000).toISOString()
    });

    this.assessmentQuality.push({
      id: "40000000-0000-0000-0000-000000000001",
      assessmentSessionId: arjunSessionId,
      framingScore: 0.940,
      lightingScore: 0.910,
      poseVisibilityRatio: 0.985,
      challengeVerified: true,
      calibrationDetected: true,
      overallQualityScore: 0.945,
      validationStatus: "VALID",
      createdAt: new Date(Date.now() - 7090000).toISOString()
    });

    this.assessmentMetrics.push(
      {
        id: uuidv4(),
        assessmentSessionId: arjunSessionId,
        metricCode: "JUMP_HEIGHT_CM",
        metricValue: 48.5,
        metricUnit: "cm",
        cohortPercentile: 94.2,
        metricConfidence: 0.920,
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        assessmentSessionId: arjunSessionId,
        metricCode: "FLIGHT_TIME_MS",
        metricValue: 628.0,
        metricUnit: "ms",
        cohortPercentile: 93.8,
        metricConfidence: 0.940,
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        assessmentSessionId: arjunSessionId,
        metricCode: "TAKEOFF_VELOCITY_MS",
        metricValue: 3.08,
        metricUnit: "m/s",
        cohortPercentile: 94.0,
        metricConfidence: 0.910,
        createdAt: new Date().toISOString()
      }
    );

    this.assessmentScores.push({
      id: "50000000-0000-0000-0000-000000000001",
      assessmentSessionId: arjunSessionId,
      potentialBand: "HIGH",
      overallScore: 92.50,
      confidenceScore: 0.895,
      scoringVersion: "v1.0.0-heuristic",
      strongIndicators: [
        {
          metric: "JUMP_HEIGHT_CM",
          percentile: 94.2,
          label: "Explosive Vertical Power",
          valueDescription: "48.5 cm (Top 6% in Age 15 Male Cohort)"
        }
      ],
      areasForVerification: [
        {
          metric: "SPRINT_20M_SEC",
          reason: "Requires high-speed 20m electronic timing gate verification",
          suggestedTrialCheck: "Schedule 20m / 60m physical track trial"
        }
      ],
      recommendedAction: "District Physical Trial - Gachibowli Stadium, Hyderabad",
      createdAt: new Date().toISOString()
    });

    this.athleteShortlists.push({
      id: "60000000-0000-0000-0000-000000000001",
      athleteId: arjunProfile.id,
      assessmentSessionId: arjunSessionId,
      status: "PENDING_REVIEW",
      priorityLevel: 1,
      createdAt: new Date().toISOString()
    });

    // 6. Physical Trials
    this.physicalTrials.push(
      {
        id: "70000000-0000-0000-0000-000000000001",
        title: "Telangana State Grassroots Athletics Trial 2026",
        sportId: "11111111-1111-1111-1111-111111111111",
        venueName: "Gachibowli Athletics Stadium, Hyderabad",
        district: "Hyderabad",
        state: "Telangana",
        trialDate: "2026-09-15",
        coordinatorContact: "Coach K. Srinivas (+91-9440123456)",
        createdAt: new Date().toISOString()
      },
      {
        id: "70000000-0000-0000-0000-000000000002",
        title: "North India Junior Football Talent Selection",
        sportId: "22222222-2222-2222-2222-222222222222",
        venueName: "Tau Devi Lal Stadium, Gurugram",
        district: "Gurugram",
        state: "Haryana",
        trialDate: "2026-09-20",
        coordinatorContact: "Coach Anil Sangwan (+91-9812345678)",
        createdAt: new Date().toISOString()
      }
    );

    // 7. Benchmark Cohorts
    this.benchmarkCohorts = [
      { id: uuidv4(), sportCode: "ATHLETICS_SPRINT", metricCode: "JUMP_HEIGHT_CM", gender: "MALE", minAge: 15, maxAge: 16, p10: 28.0, p25: 33.5, p50: 39.0, p75: 45.0, p90: 50.5, p95: 54.0, p99: 60.5, sampleSource: "SIH Database v1" },
      { id: uuidv4(), sportCode: "ATHLETICS_SPRINT", metricCode: "JUMP_HEIGHT_CM", gender: "FEMALE", minAge: 15, maxAge: 16, p10: 22.0, p25: 26.5, p50: 31.5, p75: 37.0, p90: 42.0, p95: 45.5, p99: 50.0, sampleSource: "SIH Database v1" },
      { id: uuidv4(), sportCode: "ATHLETICS_SPRINT", metricCode: "SPRINT_20M_SEC", gender: "MALE", minAge: 15, maxAge: 16, p10: 3.65, p25: 3.40, p50: 3.18, p75: 2.98, p90: 2.82, p95: 2.74, p99: 2.62, sampleSource: "SIH Database v1" },
      { id: uuidv4(), sportCode: "GENERAL_FITNESS", metricCode: "SQUAT_SYMMETRY_PCT", gender: "MALE", minAge: 10, maxAge: 18, p10: 70.0, p25: 78.0, p50: 85.0, p75: 92.0, p90: 96.0, p95: 98.0, p99: 99.5, sampleSource: "SIH Biomechanical Norms" }
    ];
  }

  // --- Users & Profiles ---
  async getUserByPhone(phone) {
    return this.users.find(u => u.phone === phone);
  }

  async getUserById(id) {
    const user = this.users.find(u => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async createUser(userData) {
    const newUser = {
      id: uuidv4(),
      fullName: userData.fullName,
      phone: userData.phone,
      email: userData.email || null,
      role: userData.role || "ATHLETE",
      passwordHash: userData.passwordHash,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.push(newUser);
    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  async getAthleteByUserId(userId) {
    return this.athleteProfiles.find(a => a.userId === userId) || null;
  }

  async getAthleteById(id) {
    return this.athleteProfiles.find(a => a.id === id) || null;
  }

  async createAthleteProfile(profileData) {
    const newProfile = {
      id: uuidv4(),
      userId: profileData.userId,
      dob: profileData.dob,
      gender: profileData.gender,
      state: profileData.state,
      district: profileData.district,
      pincode: profileData.pincode || null,
      heightCm: Number(profileData.heightCm) || 0,
      weightKg: Number(profileData.weightKg) || 0,
      dominantSide: profileData.dominantSide || "RIGHT",
      preferredSport: profileData.preferredSport,
      schoolOrCentre: profileData.schoolOrCentre || null,
      guardianName: profileData.guardianName || null,
      guardianPhone: profileData.guardianPhone || null,
      guardianConsent: Boolean(profileData.guardianConsent),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.athleteProfiles.push(newProfile);
    return newProfile;
  }

  async updateAthleteProfile(athleteId, updateData) {
    const profile = this.athleteProfiles.find(a => a.id === athleteId || a.userId === athleteId);
    if (!profile) return null;
    Object.assign(profile, updateData, { updatedAt: new Date().toISOString() });
    return profile;
  }

  // --- Scout Profiles ---
  async createScoutProfile(profileData) {
    const newProfile = {
      id: uuidv4(),
      userId: profileData.userId,
      organization: profileData.organization || "Sports Authority of India (SAI)",
      badgeId: profileData.badgeId || `SAI-SCOUT-${Math.floor(1000 + Math.random() * 9000)}`,
      designation: profileData.designation || "District Talent Scout",
      assignedState: profileData.assignedState || "National",
      assignedDistricts: profileData.assignedDistricts || [],
      specialization: profileData.specialization || "GENERAL_FITNESS",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.scoutProfiles.push(newProfile);
    return newProfile;
  }

  async getScoutByUserId(userId) {
    return this.scoutProfiles.find(s => s.userId === userId) || null;
  }

  // --- Assessments ---
  async getAssessmentTypes() {
    return this.assessmentTypes.filter(t => t.isActive);
  }

  async getAssessmentTypeByCode(code) {
    return this.assessmentTypes.find(t => t.code === code);
  }

  async createAssessmentSession(sessionData) {
    const newSession = {
      id: uuidv4(),
      athleteId: sessionData.athleteId,
      assessmentTypeId: sessionData.assessmentTypeId,
      sessionToken: sessionData.sessionToken,
      challengeType: sessionData.challengeType,
      challengeInstruction: sessionData.challengeInstruction,
      deviceMetadata: sessionData.deviceMetadata || {},
      status: "INITIALIZED",
      startedAt: new Date().toISOString(),
      completedAt: null
    };
    this.assessmentSessions.push(newSession);
    return newSession;
  }

  async getAssessmentSessionById(id) {
    return this.assessmentSessions.find(s => s.id === id) || null;
  }

  async updateAssessmentSessionStatus(id, status, completedAt = null) {
    const session = this.assessmentSessions.find(s => s.id === id);
    if (session) {
      session.status = status;
      if (completedAt) session.completedAt = completedAt;
    }
    return session;
  }

  async createAssessmentVideo(videoData) {
    const video = {
      id: uuidv4(),
      assessmentSessionId: videoData.assessmentSessionId,
      rawVideoKey: videoData.rawVideoKey,
      overlayVideoKey: videoData.overlayVideoKey || null,
      keyframeKeys: videoData.keyframeKeys || [],
      videoSha256: videoData.videoSha256,
      durationSec: Number(videoData.durationSec) || 0,
      fps: Number(videoData.fps) || 30.0,
      resolutionW: Number(videoData.resolutionW) || 1280,
      resolutionH: Number(videoData.resolutionH) || 720,
      createdAt: new Date().toISOString()
    };
    this.assessmentVideos.push(video);
    return video;
  }

  async getAssessmentVideoBySha256(sha256) {
    return this.assessmentVideos.find(v => v.videoSha256 === sha256) || null;
  }

  async getAssessmentVideoBySessionId(sessionId) {
    return this.assessmentVideos.find(v => v.assessmentSessionId === sessionId) || null;
  }

  async createAssessmentQuality(qualityData) {
    const quality = {
      id: uuidv4(),
      assessmentSessionId: qualityData.assessmentSessionId,
      framingScore: qualityData.framingScore,
      lightingScore: qualityData.lightingScore,
      poseVisibilityRatio: qualityData.poseVisibilityRatio,
      challengeVerified: qualityData.challengeVerified,
      calibrationDetected: qualityData.calibrationDetected,
      overallQualityScore: qualityData.overallQualityScore,
      validationStatus: qualityData.validationStatus,
      rejectionReasons: qualityData.rejectionReasons || [],
      createdAt: new Date().toISOString()
    };
    this.assessmentQuality.push(quality);
    return quality;
  }

  async getAssessmentQualityBySessionId(sessionId) {
    return this.assessmentQuality.find(q => q.assessmentSessionId === sessionId) || null;
  }

  async createAssessmentMetrics(metricsArray) {
    const saved = [];
    for (const m of metricsArray) {
      const metric = {
        id: uuidv4(),
        assessmentSessionId: m.assessmentSessionId,
        metricCode: m.metricCode,
        metricValue: m.metricValue,
        metricUnit: m.metricUnit,
        cohortPercentile: m.cohortPercentile,
        metricConfidence: m.metricConfidence,
        createdAt: new Date().toISOString()
      };
      this.assessmentMetrics.push(metric);
      saved.push(metric);
    }
    return saved;
  }

  async getAssessmentMetricsBySessionId(sessionId) {
    return this.assessmentMetrics.filter(m => m.assessmentSessionId === sessionId);
  }

  async createAssessmentScore(scoreData) {
    const score = {
      id: uuidv4(),
      assessmentSessionId: scoreData.assessmentSessionId,
      potentialBand: scoreData.potentialBand,
      overallScore: scoreData.overallScore,
      confidenceScore: scoreData.confidenceScore,
      scoringVersion: scoreData.scoringVersion || "v1.0.0-heuristic",
      strongIndicators: scoreData.strongIndicators || [],
      areasForVerification: scoreData.areasForVerification || [],
      recommendedAction: scoreData.recommendedAction,
      createdAt: new Date().toISOString()
    };
    this.assessmentScores.push(score);
    return score;
  }

  async getAssessmentScoreBySessionId(sessionId) {
    return this.assessmentScores.find(s => s.assessmentSessionId === sessionId) || null;
  }

  // --- Scout Discovery & Shortlists ---
  async createShortlist(shortlistData) {
    const existing = this.athleteShortlists.find(s => s.assessmentSessionId === shortlistData.assessmentSessionId);
    if (existing) return existing;

    const shortlist = {
      id: uuidv4(),
      athleteId: shortlistData.athleteId,
      assessmentSessionId: shortlistData.assessmentSessionId,
      status: shortlistData.status || "PENDING_REVIEW",
      priorityLevel: shortlistData.priorityLevel || 1,
      createdAt: new Date().toISOString()
    };
    this.athleteShortlists.push(shortlist);
    return shortlist;
  }

  async getShortlists(filters = {}) {
    let results = this.athleteShortlists.map(sh => {
      const athlete = this.athleteProfiles.find(a => a.id === sh.athleteId);
      const user = athlete ? this.users.find(u => u.id === athlete.userId) : null;
      const session = this.assessmentSessions.find(s => s.id === sh.assessmentSessionId);
      const score = this.assessmentScores.find(sc => sc.assessmentSessionId === sh.assessmentSessionId);
      const quality = this.assessmentQuality.find(q => q.assessmentSessionId === sh.assessmentSessionId);
      const metrics = this.assessmentMetrics.filter(m => m.assessmentSessionId === sh.assessmentSessionId);
      const video = this.assessmentVideos.find(v => v.assessmentSessionId === sh.assessmentSessionId);
      const reviews = this.scoutReviews.filter(r => r.shortlistId === sh.id);

      return {
        ...sh,
        athlete: athlete ? { ...athlete, user: user ? { id: user.id, fullName: user.fullName, phone: user.phone, email: user.email } : null } : null,
        session,
        score,
        quality,
        metrics,
        video,
        reviews
      };
    });

    if (filters.state) {
      results = results.filter(r => r.athlete && r.athlete.state.toLowerCase() === filters.state.toLowerCase());
    }
    if (filters.district) {
      results = results.filter(r => r.athlete && r.athlete.district.toLowerCase() === filters.district.toLowerCase());
    }
    if (filters.sport) {
      results = results.filter(r => r.athlete && r.athlete.preferredSport.toLowerCase() === filters.sport.toLowerCase());
    }
    if (filters.minScore) {
      results = results.filter(r => r.score && r.score.overallScore >= Number(filters.minScore));
    }
    if (filters.status) {
      results = results.filter(r => r.status === filters.status);
    }

    return results;
  }

  async createScoutReview(reviewData) {
    const review = {
      id: uuidv4(),
      shortlistId: reviewData.shortlistId,
      scoutId: reviewData.scoutId,
      decision: reviewData.decision,
      reviewNotes: reviewData.reviewNotes,
      createdAt: new Date().toISOString()
    };
    this.scoutReviews.push(review);

    const shortlist = this.athleteShortlists.find(s => s.id === reviewData.shortlistId);
    if (shortlist) {
      shortlist.status = reviewData.decision;
    }

    return review;
  }

  // --- Trials ---
  async getPhysicalTrials() {
    return this.physicalTrials;
  }

  async createPhysicalTrial(trialData) {
    const trial = {
      id: uuidv4(),
      title: trialData.title,
      sportId: trialData.sportId || null,
      venueName: trialData.venueName,
      district: trialData.district,
      state: trialData.state,
      trialDate: trialData.trialDate,
      coordinatorContact: trialData.coordinatorContact,
      createdAt: new Date().toISOString()
    };
    this.physicalTrials.push(trial);
    return trial;
  }

  async createTrialInvitation(invitationData) {
    const inv = {
      id: uuidv4(),
      trialId: invitationData.trialId,
      athleteId: invitationData.athleteId,
      status: "INVITED",
      invitationSentAt: new Date().toISOString(),
      trialResultNotes: null
    };
    this.trialInvitations.push(inv);
    return inv;
  }

  async getTrialInvitationsByAthleteId(athleteId) {
    return this.trialInvitations
      .filter(i => i.athleteId === athleteId)
      .map(i => ({
        ...i,
        trial: this.physicalTrials.find(t => t.id === i.trialId)
      }));
  }

  // --- Benchmarks & Audit Logs ---
  async getBenchmarks(sportCode, metricCode, gender) {
    return this.benchmarkCohorts.filter(b => 
      b.sportCode === sportCode &&
      b.metricCode === metricCode &&
      b.gender === gender
    );
  }

  async createAuditLog(logData) {
    const log = {
      id: uuidv4(),
      userId: logData.userId || null,
      action: logData.action,
      entityName: logData.entityName,
      entityId: logData.entityId || null,
      ipAddress: logData.ipAddress || null,
      metadata: logData.metadata || {},
      createdAt: new Date().toISOString()
    };
    this.auditLogs.push(log);
    return log;
  }
}

const db = new DatabaseService();
module.exports = db;
