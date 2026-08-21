const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../db");
const { generateToken, authenticate } = require("../middleware/auth");
const { auditLog } = require("../middleware/audit");

// POST /api/v1/auth/register
router.post("/register", auditLog("USER_REGISTER", "users"), async (req, res) => {
  try {
    const { fullName, phone, email, password, role, profileData } = req.body;

    if (!fullName || !phone || !password) {
      return res.status(400).json({ success: false, error: "Missing required fields: fullName, phone, password" });
    }

    const existingUser = await db.getUserByPhone(phone);
    if (existingUser) {
      return res.status(409).json({ success: false, error: "An account with this phone number already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.createUser({
      fullName,
      phone,
      email,
      role: role || "ATHLETE",
      passwordHash
    });

    let athleteProfile = null;
    let scoutProfile = null;

    if (user.role === "ATHLETE" && profileData) {
      // Check Minor Guardian Consent
      if (profileData.dob) {
        const birthDate = new Date(profileData.dob);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);

        if (age < 18 && !profileData.guardianConsent) {
          return res.status(400).json({
            success: false,
            error: "DPDP Act Compliance: Guardian consent is mandatory for athletes under 18 years of age."
          });
        }
      }

      athleteProfile = await db.createAthleteProfile({
        userId: user.id,
        ...profileData
      });
    } else if (user.role === "SCOUT") {
      scoutProfile = await db.createScoutProfile({
        userId: user.id,
        ...(profileData || {})
      });
    }

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user,
      athleteProfile,
      scoutProfile
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ success: false, error: "Internal server error during registration" });
  }
});

// POST /api/v1/auth/login
router.post("/login", auditLog("USER_LOGIN", "users"), async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, error: "Phone number and password are required" });
    }

    const user = await db.getUserByPhone(phone);
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const token = generateToken(user);
    const athleteProfile = user.role === "ATHLETE" ? await db.getAthleteByUserId(user.id) : null;
    const scoutProfile = user.role === "SCOUT" ? await db.getScoutByUserId(user.id) : null;
    const { passwordHash, ...safeUser } = user;

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser,
      athleteProfile,
      scoutProfile
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ success: false, error: "Internal server error during login" });
  }
});

// GET /api/v1/auth/me
router.get("/me", authenticate, async (req, res) => {
  try {
    const athleteProfile = req.user.role === "ATHLETE" ? await db.getAthleteByUserId(req.user.id) : null;
    const scoutProfile = req.user.role === "SCOUT" ? await db.getScoutByUserId(req.user.id) : null;
    return res.json({
      success: true,
      user: req.user,
      athleteProfile,
      scoutProfile
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch user profile" });
  }
});

module.exports = router;
