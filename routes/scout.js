const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticate, authorize } = require("../middleware/auth");
const { auditLog } = require("../middleware/audit");
const { getAccessibleVideoUrl } = require("../services/storage");

// Apply Scout / Admin authorization to all scout routes
router.use(authenticate, authorize("SCOUT", "ADMIN", "SAI_OFFICIAL"));

// GET /api/v1/scout/athletes (Discovery search with multi-parameter filtering)
router.get("/athletes", async (req, res) => {
  try {
    const { state, district, sport, minScore, status } = req.query;
    const shortlists = await db.getShortlists({ state, district, sport, minScore, status });

    const formatted = shortlists.map(s => ({
      shortlistId: s.id,
      athleteId: s.athleteId,
      fullName: s.athlete && s.athlete.user ? s.athlete.user.fullName : "Unknown",
      phone: s.athlete && s.athlete.user ? s.athlete.user.phone : null,
      dob: s.athlete ? s.athlete.dob : null,
      gender: s.athlete ? s.athlete.gender : null,
      state: s.athlete ? s.athlete.state : null,
      district: s.athlete ? s.athlete.district : null,
      preferredSport: s.athlete ? s.athlete.preferredSport : null,
      schoolOrCentre: s.athlete ? s.athlete.schoolOrCentre : null,
      overallScore: s.score ? s.score.overallScore : null,
      potentialBand: s.score ? s.score.potentialBand : null,
      confidenceScore: s.score ? s.score.confidenceScore : null,
      strongIndicators: s.score ? s.score.strongIndicators : [],
      status: s.status,
      sessionDate: s.session ? s.session.startedAt : s.createdAt
    }));

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (err) {
    console.error("Scout Discovery Search Error:", err);
    return res.status(500).json({ success: false, error: "Failed to search athlete database" });
  }
});

// GET /api/v1/scout/athletes/:id/evidence (Dossier with synchronized videos & metrics)
router.get("/athletes/:id/evidence", async (req, res) => {
  try {
    const athleteId = req.params.id;
    const athlete = await db.getAthleteById(athleteId);
    if (!athlete) {
      return res.status(404).json({ success: false, error: "Athlete not found" });
    }

    const user = await db.getUserById(athlete.userId);
    const shortlists = await db.getShortlists();
    const athleteShortlists = shortlists.filter(s => s.athleteId === athleteId);

    const assessmentsData = athleteShortlists.map(sh => ({
      shortlistId: sh.id,
      sessionId: sh.assessmentSessionId,
      status: sh.status,
      score: sh.score,
      quality: sh.quality,
      metrics: sh.metrics,
      reviews: sh.reviews,
      video: sh.video ? {
        rawVideoUrl: getAccessibleVideoUrl(sh.video.rawVideoKey),
        overlayVideoUrl: getAccessibleVideoUrl(sh.video.overlayVideoKey),
        fps: sh.video.fps,
        durationSec: sh.video.durationSec
      } : null
    }));

    return res.json({
      success: true,
      data: {
        athlete: {
          ...athlete,
          fullName: user ? user.fullName : "Unknown",
          phone: user ? user.phone : null,
          email: user ? user.email : null
        },
        assessments: assessmentsData
      }
    });
  } catch (err) {
    console.error("Scout Evidence Fetch Error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch athlete evidence dossier" });
  }
});

// POST /api/v1/scout/shortlists/:id/review (Human-in-the-loop audit decision)
router.post("/shortlists/:id/review", auditLog("SCOUT_REVIEW_DECISION", "scout_reviews"), async (req, res) => {
  try {
    const shortlistId = req.params.id;
    const { decision, reviewNotes } = req.body;

    const validDecisions = ["APPROVED_FOR_TRIAL", "NEEDS_PHYSICAL_RETEST", "REJECTED", "PENDING_REVIEW"];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({
        success: false,
        error: `Invalid decision: ${decision}. Expected one of: ${validDecisions.join(", ")}`
      });
    }

    const review = await db.createScoutReview({
      shortlistId,
      scoutId: req.user.id,
      decision,
      reviewNotes: reviewNotes || "Scout review completed"
    });

    return res.json({
      success: true,
      message: `Shortlist successfully updated to ${decision}`,
      data: review
    });
  } catch (err) {
    console.error("Scout Review Error:", err);
    return res.status(500).json({ success: false, error: "Failed to record scout review" });
  }
});

module.exports = router;
