const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticate, authorize } = require("../middleware/auth");
const { auditLog } = require("../middleware/audit");

// GET /api/v1/athletes/me
router.get("/me", authenticate, authorize("ATHLETE"), async (req, res) => {
  try {
    const profile = await db.getAthleteByUserId(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: "Athlete profile not found" });
    }

    const shortlists = await db.getShortlists();
    const athleteShortlist = shortlists.find(s => s.athleteId === profile.id);
    const invitations = await db.getTrialInvitationsByAthleteId(profile.id);

    return res.json({
      success: true,
      data: {
        profile,
        user: req.user,
        shortlistStatus: athleteShortlist ? athleteShortlist.status : null,
        assessmentScore: athleteShortlist ? athleteShortlist.score : null,
        invitations
      }
    });
  } catch (err) {
    console.error("Fetch Athlete Error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch athlete information" });
  }
});

// PUT /api/v1/athletes/me (Update physical profile & DPDP verification)
router.put("/me", authenticate, authorize("ATHLETE"), async (req, res) => {
  try {
    const profile = await db.getAthleteByUserId(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: "Athlete profile not found" });
    }

    const { heightCm, weightKg, preferredSport, state, district, dob, guardianConsent } = req.body;

    if (dob) {
      const birthDate = new Date(dob);
      const ageDifMs = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDifMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);

      if (age < 18 && guardianConsent === false) {
        return res.status(400).json({
          success: false,
          error: "DPDP Act Compliance: Minor athletes must maintain active guardian consent."
        });
      }
    }

    const updated = await db.updateAthleteProfile(profile.id, {
      ...(heightCm !== undefined && { heightCm: Number(heightCm) }),
      ...(weightKg !== undefined && { weightKg: Number(weightKg) }),
      ...(preferredSport && { preferredSport }),
      ...(state && { state }),
      ...(district && { district }),
      ...(dob && { dob })
    });

    return res.json({
      success: true,
      message: "Athlete profile updated successfully.",
      data: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/athletes/profile (For Operators or Self-Registration completion)
router.post("/profile", authenticate, auditLog("CREATE_ATHLETE_PROFILE", "athlete_profiles"), async (req, res) => {
  try {
    const {
      userId,
      dob,
      gender,
      state,
      district,
      pincode,
      heightCm,
      weightKg,
      dominantSide,
      preferredSport,
      schoolOrCentre,
      guardianName,
      guardianPhone,
      guardianConsent
    } = req.body;

    const targetUserId = req.user.role === "OPERATOR" || req.user.role === "ADMIN" ? (userId || req.user.id) : req.user.id;

    if (!dob || !gender || !state || !district || !preferredSport) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: dob, gender, state, district, preferredSport"
      });
    }

    // DPDP Minor Age Consent Verification
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 18 && !guardianConsent) {
      return res.status(400).json({
        success: false,
        error: "DPDP Act Compliance: Athletes under 18 require verified guardian consent."
      });
    }

    const profile = await db.createAthleteProfile({
      userId: targetUserId,
      dob,
      gender,
      state,
      district,
      pincode,
      heightCm,
      weightKg,
      dominantSide: dominantSide || "RIGHT",
      preferredSport,
      schoolOrCentre,
      guardianName,
      guardianPhone,
      guardianConsent: Boolean(guardianConsent)
    });

    return res.status(201).json({
      success: true,
      message: "Athlete profile created successfully",
      data: profile
    });
  } catch (err) {
    console.error("Create Athlete Profile Error:", err);
    return res.status(500).json({ success: false, error: "Failed to create athlete profile" });
  }
});

// GET /api/v1/athletes/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const profile = await db.getAthleteById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: "Athlete not found" });
    }

    // Privacy mask for non-privileged viewers
    const user = await db.getUserById(profile.userId);
    const isOwner = req.user.id === profile.userId;
    const isScoutOrAdmin = req.user.role === "SCOUT" || req.user.role === "ADMIN" || req.user.role === "SAI_OFFICIAL";

    if (!isOwner && !isScoutOrAdmin) {
      return res.status(403).json({ success: false, error: "Access denied to athlete profile" });
    }

    return res.json({
      success: true,
      data: {
        profile,
        user: user ? { id: user.id, fullName: user.fullName } : null
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to retrieve athlete" });
  }
});

module.exports = router;
