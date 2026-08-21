const fs = require("fs");
const path = require("path");
const http = require("http");
const app = require("../src/app");

let server;
let baseUrl;

async function runTests() {
  console.log("================================================================================");
  console.log("             RUNNING BACKEND API & DPDP COMPLIANCE INTEGRATION TESTS            ");
  console.log("================================================================================");

  // Start temporary server
  await new Promise(resolve => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api/v1`;
      console.log(`[TEST SERVER] Running on port ${port}`);
      resolve();
    });
  });

  let testsPassed = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      testsPassed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      throw new Error(`Test assertion failed: ${testName}`);
    }
  }

  try {
    // 1. Healthcheck
    const healthRes = await fetch(`http://localhost:${server.address().port}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === "HEALTHY", "GET /health responds with 200 HEALTHY");

    // 2. Scout Login (Coach Vikram)
    const scoutLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "9876543210", password: "password123" })
    });
    const scoutLoginData = await scoutLoginRes.json();
    assert(scoutLoginRes.status === 200 && scoutLoginData.token && scoutLoginData.user.role === "SCOUT", "Scout login authenticates and returns JWT token");
    const scoutToken = scoutLoginData.token;

    // 3. DPDP Act Minor Protection - Rejection Test (Under 18 without consent)
    const minorNoConsentRes = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test Minor Runner",
        phone: "9876500001",
        password: "password123",
        role: "ATHLETE",
        profileData: {
          dob: "2011-06-15", // Age ~15
          gender: "MALE",
          state: "Punjab",
          district: "Patiala",
          preferredSport: "ATHLETICS_SPRINT",
          guardianConsent: false // Missing consent
        }
      })
    });
    const minorNoConsentData = await minorNoConsentRes.json();
    assert(minorNoConsentRes.status === 400 && minorNoConsentData.error.includes("DPDP Act Compliance"), "DPDP Compliance: Rejects minor athlete registration without guardian consent");

    // 4. Minor Registration with Valid Guardian Consent
    const minorWithConsentRes = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Rahul Verma",
        phone: "9876500002",
        password: "password123",
        role: "ATHLETE",
        profileData: {
          dob: "2011-06-15", // Age ~15
          gender: "MALE",
          state: "Punjab",
          district: "Patiala",
          preferredSport: "ATHLETICS_SPRINT",
          heightCm: 169.0,
          weightKg: 58.0,
          guardianName: "Sunil Verma",
          guardianPhone: "9876500099",
          guardianConsent: true // Verified consent
        }
      })
    });
    const minorWithConsentData = await minorWithConsentRes.json();
    assert(minorWithConsentRes.status === 201 && minorWithConsentData.token, "Register minor athlete with valid guardian consent");
    const athleteToken = minorWithConsentData.token;
    const athleteId = minorWithConsentData.athleteProfile.id;

    // 5. Assessment Initiation & Dynamic Anti-Cheat Challenge
    const initRes = await fetch(`${baseUrl}/assessments/initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${athleteToken}`
      },
      body: JSON.stringify({ assessmentTypeCode: "VERTICAL_JUMP" })
    });
    const initData = await initRes.json();
    assert(initRes.status === 201 && initData.data.sessionId && initData.data.challenge.instruction, "Initiate assessment returns sessionId and dynamic anti-cheat gesture challenge");
    const sessionId = initData.data.sessionId;

    // 6. Assessment Video Upload (Create mock video file)
    const mockVideoPath = path.join(__dirname, "mock_test_jump.mp4");
    fs.writeFileSync(mockVideoPath, Buffer.from("MOCK_SIH_VIDEO_DATA_HEADER_KEYFRAMES_JUMP"));

    const formData = new FormData();
    const fileBlob = new Blob([fs.readFileSync(mockVideoPath)], { type: "video/mp4" });
    formData.append("video", fileBlob, "mock_test_jump.mp4");

    const uploadRes = await fetch(`${baseUrl}/assessments/${sessionId}/upload`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${athleteToken}` },
      body: formData
    });
    const uploadData = await uploadRes.json();
    assert(uploadRes.status === 200 && uploadData.data.status === "UPLOADED" && uploadData.data.videoSha256, "Upload assessment video computes SHA-256 integrity checksum");

    // Clean up mock file
    if (fs.existsSync(mockVideoPath)) fs.unlinkSync(mockVideoPath);

    // 7. Process Assessment & AI Kinematics Engine
    const processRes = await fetch(`${baseUrl}/assessments/${sessionId}/process`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${athleteToken}` }
    });
    const processData = await processRes.json();
    assert(processRes.status === 200 && processData.data.score.potentialBand === "HIGH" && processData.data.score.overallScore > 80, "AI processing extracts kinematics and classifies into HIGH potential band");

    // 8. Fetch Detailed Result Dossier
    const resultsRes = await fetch(`${baseUrl}/assessments/${sessionId}/results`, {
      headers: { "Authorization": `Bearer ${athleteToken}` }
    });
    const resultsData = await resultsRes.json();
    assert(resultsRes.status === 200 && resultsData.data.metrics.length > 0 && resultsData.data.score.strongIndicators.length > 0, "Fetch results returns explainable strong indicators and kinematics");

    // 9. Scout Discovery Search & Filtering
    const scoutSearchRes = await fetch(`${baseUrl}/scout/athletes?sport=ATHLETICS_SPRINT`, {
      headers: { "Authorization": `Bearer ${scoutToken}` }
    });
    const scoutSearchData = await scoutSearchRes.json();
    assert(scoutSearchRes.status === 200 && scoutSearchData.count >= 1, "Scout search discovers shortlisted candidates by sport and cohort");

    // 10. Scout Review Decision (Audit Trail)
    const shortlistId = scoutSearchData.data[0].shortlistId;
    const reviewRes = await fetch(`${baseUrl}/scout/shortlists/${shortlistId}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${scoutToken}`
      },
      body: JSON.stringify({
        decision: "APPROVED_FOR_TRIAL",
        reviewNotes: "Approved based on explosive vertical jump power (94th percentile)."
      })
    });
    const reviewData = await reviewRes.json();
    assert(reviewRes.status === 200 && reviewData.data.decision === "APPROVED_FOR_TRIAL", "Scout audit decision approves candidate for physical trial");

    // 11. Physical Trial Invitation Dispatch
    const trialsRes = await fetch(`${baseUrl}/trials`, {
      headers: { "Authorization": `Bearer ${scoutToken}` }
    });
    const trialsData = await trialsRes.json();
    const trialId = trialsData.data[0].id;

    const inviteRes = await fetch(`${baseUrl}/trials/${trialId}/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${scoutToken}`
      },
      body: JSON.stringify({ athleteId })
    });
    const inviteData = await inviteRes.json();
    assert(inviteRes.status === 201 && inviteData.data.status === "INVITED", "Scout dispatches physical trial invitation to candidate");

    console.log("================================================================================");
    console.log(`       ALL ${testsPassed}/${totalTests} INTEGRATION TESTS PASSED WITH 100% SUCCESS RATE!        `);
    console.log("================================================================================");
  } catch (err) {
    console.error("Test Suite Failed:", err);
    process.exit(1);
  } finally {
    if (server) server.close();
  }
}

runTests();
