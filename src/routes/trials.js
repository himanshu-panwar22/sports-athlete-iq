const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticate, authorize } = require("../middleware/auth");
const { auditLog } = require("../middleware/audit");

// GET /api/v1/trials (List scheduled physical verification trials)
router.get("/", authenticate, async (req, res) => {
  try {
    const trials = await db.getPhysicalTrials();
    return res.json({ success: true, data: trials });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch trials" });
  }
});

// POST /api/v1/trials (Schedule a new trial - Scout/Admin only)
router.post("/", authenticate, authorize("SCOUT", "ADMIN", "SAI_OFFICIAL"), auditLog("CREATE_TRIAL", "physical_trials"), async (req, res) => {
  try {
    const { title, sportId, venueName, district, state, trialDate, coordinatorContact } = req.body;

    if (!title || !venueName || !district || !state || !trialDate) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, venueName, district, state, trialDate"
      });
    }

    const trial = await db.createPhysicalTrial({
      title,
      sportId,
      venueName,
      district,
      state,
      trialDate,
      coordinatorContact
    });

    return res.status(201).json({
      success: true,
      message: "Physical trial scheduled successfully",
      data: trial
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to schedule trial" });
  }
});

// POST /api/v1/trials/:id/invite (Dispatch trial invitation to athlete)
router.post("/:id/invite", authenticate, authorize("SCOUT", "ADMIN", "SAI_OFFICIAL"), auditLog("INVITE_ATHLETE_TRIAL", "trial_invitations"), async (req, res) => {
  try {
    const trialId = req.params.id;
    const { athleteId } = req.body;

    if (!athleteId) {
      return res.status(400).json({ success: false, error: "athleteId is required" });
    }

    const athlete = await db.getAthleteById(athleteId);
    if (!athlete) {
      return res.status(404).json({ success: false, error: "Athlete not found" });
    }

    const invitation = await db.createTrialInvitation({
      trialId,
      athleteId
    });

    return res.status(201).json({
      success: true,
      message: "Trial invitation dispatched to athlete",
      data: invitation
    });
  } catch (err) {
    console.error("Invite Athlete Error:", err);
    return res.status(500).json({ success: false, error: "Failed to dispatch invitation" });
  }
});

module.exports = router;
