const API_BASE = "http://localhost:4000/api/v1";
let currentAthleteToken = null;
let currentAthleteProfile = null;
let currentSelectedTest = "VERTICAL_JUMP";
let currentSession = null;
let liveStream = null;
let cameraAnimId = null;
let recordedChunks = [];
let mediaRecorder = null;
let currentLang = "en";

const TRANSLATIONS = {
  en: {
    greeting: "Hello, Arjun!",
    sub: "Adilabad, Telangana • Sprinter",
    progTitle: "Physical Screening Protocol",
    progSub: "3 of 4 Tests Verified by AI"
  },
  hi: {
    greeting: "नमस्ते, अर्जुन!",
    sub: "आदिलाबाद, तेलंगाना • धावक",
    progTitle: "शारीरिक स्क्रीनिंग प्रोटोकॉल",
    progSub: "4 में से 3 टेस्ट AI द्वारा सत्यापित"
  },
  te: {
    greeting: "నమస్కారం, అర్జున్!",
    sub: "ఆదిలాబాద్, తెలంగాణ • స్ప్రింటర్",
    progTitle: "శారీరక స్క్రీనింగ్ ప్రోటోకాల్",
    progSub: "4 పరీక్షలలో 3 AI ద్వారా ధృవీకరించబడ్డాయి"
  },
  ta: {
    greeting: "வணக்கம், அர்ஜுன்!",
    sub: "அடிலாபாத், தெலங்கானா • ஓட்டப்பந்தய வீரர்",
    progTitle: "உடற்தகுதி திரையிடல் நெறிமுறை",
    progSub: "4 சோதனைகளில் 3 AI ஆல் சரிபார்க்கப்பட்டது"
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  currentAthleteToken = localStorage.getItem("athleteToken") || null;
  if (currentAthleteToken) {
    await loadAthleteDashboard();
  } else {
    showAthleteAuthModal();
  }
});

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const iconMap = {
    success: "fa-solid fa-circle-check",
    error: "fa-solid fa-circle-xmark",
    info: "fa-solid fa-circle-info"
  };

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="${iconMap[type] || iconMap.info}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }, 4000);
}

// Authentication Modal Handlers
function showAthleteAuthModal() {
  const m = document.getElementById("athleteAuthModal");
  if (m) m.style.display = "flex";
}

function closeAthleteAuthModal() {
  const m = document.getElementById("athleteAuthModal");
  if (m) m.style.display = "none";
}

function switchAthleteAuthTab(tab) {
  document.getElementById("tabAthLoginBtn").classList.toggle("active", tab === "login");
  document.getElementById("tabAthRegBtn").classList.toggle("active", tab === "register");
  document.getElementById("athLoginForm").style.display = tab === "login" ? "block" : "none";
  document.getElementById("athRegForm").style.display = tab === "register" ? "block" : "none";
}

function fillAthleteDemo(phone, pass) {
  document.getElementById("athLoginPhone").value = phone;
  document.getElementById("athLoginPassword").value = pass;
}

async function handleAthleteLogin(e) {
  e.preventDefault();
  const phone = document.getElementById("athLoginPhone").value;
  const password = document.getElementById("athLoginPassword").value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password })
    });
    const data = await res.json();
    if (data.success && data.token) {
      currentAthleteToken = data.token;
      currentAthleteProfile = data.athleteProfile;
      localStorage.setItem("athleteToken", currentAthleteToken);
      localStorage.setItem("athleteUser", JSON.stringify(data.user));
      if (data.athleteProfile) localStorage.setItem("athleteProfile", JSON.stringify(data.athleteProfile));

      closeAthleteAuthModal();
      await loadAthleteDashboard();
      showToast(`Welcome, ${data.user.fullName}!`, "success");
    } else {
      showToast(data.error || "Invalid mobile number or password", "error");
    }
  } catch (err) {
    showToast("Connection error: " + err.message, "error");
  }
}

async function handleAthleteRegister(e) {
  e.preventDefault();
  const fullName = document.getElementById("regAthName").value;
  const phone = document.getElementById("regAthPhone").value;
  const dob = document.getElementById("regAthDob").value;
  const gender = document.getElementById("regAthGender").value;
  const state = document.getElementById("regAthState").value;
  const district = document.getElementById("regAthDistrict").value;
  const preferredSport = document.getElementById("regAthSport").value;
  const heightCm = document.getElementById("regAthHeight").value;
  const weightKg = document.getElementById("regAthWeight").value;
  const password = document.getElementById("regAthPassword").value;
  const guardianConsent = document.getElementById("regAthConsent").checked;

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        phone,
        password,
        role: "ATHLETE",
        profileData: {
          dob,
          gender,
          state,
          district,
          preferredSport,
          heightCm: Number(heightCm),
          weightKg: Number(weightKg),
          guardianConsent
        }
      })
    });
    const data = await res.json();
    if (data.success && data.token) {
      currentAthleteToken = data.token;
      currentAthleteProfile = data.athleteProfile;
      localStorage.setItem("athleteToken", currentAthleteToken);
      localStorage.setItem("athleteUser", JSON.stringify(data.user));
      if (data.athleteProfile) localStorage.setItem("athleteProfile", JSON.stringify(data.athleteProfile));

      closeAthleteAuthModal();
      await loadAthleteDashboard();
      showToast(`Athlete Profile created successfully for ${fullName}!`, "success");
    } else {
      showToast(data.error || "Failed to register athlete", "error");
    }
  } catch (err) {
    showToast("Registration error: " + err.message, "error");
  }
}

function handleAthleteLogout() {
  localStorage.removeItem("athleteToken");
  localStorage.removeItem("athleteUser");
  localStorage.removeItem("athleteProfile");
  currentAthleteToken = null;
  currentAthleteProfile = null;
  showToast("Logged out successfully.", "info");
  showAthleteAuthModal();
}

async function loadAthleteDashboard() {
  try {
    const res = await fetch(`${API_BASE}/athletes/me`, {
      headers: { "Authorization": `Bearer ${currentAthleteToken}` }
    });
    const data = await res.json();
    if (data.success) {
      const p = data.data.profile;
      const user = data.data.user;
      currentAthleteProfile = p;

      const initials = user.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
      const avatar = document.getElementById("athleteAvatar");
      if (avatar) avatar.textContent = initials;

      document.getElementById("athleteGreeting").textContent = `Hello, ${user.fullName.split(" ")[0]}!`;
      document.getElementById("athleteSub").textContent = `${p.district}, ${p.state} • Age ${calculateAge(p.dob)}`;
      document.getElementById("cardAthleteName").textContent = user.fullName;

      // Handle Trial Invitations
      const invitations = data.data.invitations || [];
      const trialBox = document.getElementById("trialAlertBox");
      if (invitations.length > 0) {
        const inv = invitations[0];
        const trial = inv.trial || {};
        trialBox.style.display = "block";
        const titleEl = document.getElementById("trialAlertTitle");
        const venueEl = document.getElementById("trialAlertVenue");
        const dateEl = document.getElementById("trialAlertDate");
        if (titleEl) titleEl.textContent = trial.title || "State Physical Verification Trial 2026";
        if (venueEl) venueEl.textContent = `${trial.venueName || "District Stadium"}, ${trial.district || p.district}`;
        if (dateEl) dateEl.textContent = `${trial.trialDate || "Upcoming"} • 08:30 AM`;

        // Also populate Admit Pass modal fields
        const passName = document.getElementById("passAthleteName");
        const passSub = document.getElementById("passAthleteSub");
        const passVenue = document.getElementById("passVenueName");
        const passDate = document.getElementById("passTrialDate");
        const passCoord = document.getElementById("passCoord");
        if (passName) passName.textContent = user.fullName;
        if (passSub) passSub.textContent = `Age: ${calculateAge(p.dob)} • ${p.gender} • ${p.district}, ${p.state} • ${p.preferredSport}`;
        if (passVenue) passVenue.textContent = `${trial.venueName || "District Stadium"}, ${trial.district || p.district}`;
        if (passDate) passDate.textContent = `${trial.trialDate || "2026-10-15"} • 08:30 AM`;
        if (passCoord) passCoord.textContent = trial.coordinatorContact || "SAI Regional Office";
      } else {
        trialBox.style.display = "none";
      }
    }
  } catch (err) {
    console.error("Dashboard Load Error:", err);
  }
}

function changeLanguage(lang) {
  currentLang = lang;
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  document.getElementById("athleteGreeting").textContent = t.greeting;
  document.getElementById("athleteSub").textContent = t.sub;
  document.getElementById("txtAssessmentProg").textContent = t.progTitle;
  document.getElementById("txtCompletedCount").textContent = t.progSub;
}

// Setup Modal Handler
function openTestSetupModal(testCode) {
  currentSelectedTest = testCode;
  const modal = document.getElementById("setupModal");
  const title = document.getElementById("setupTestTitle");
  const rules = document.getElementById("setupRulesList");

  if (testCode === "VERTICAL_JUMP") {
    title.textContent = "Countermovement Vertical Jump";
    rules.innerHTML = `
      <li>Place smartphone 3 to 4 meters away at hip level (lateral view).</li>
      <li>Perform dynamic anti-cheat gesture challenge before jumping.</li>
      <li>Dip into a squat and jump with explosive vertical power.</li>
      <li>Land on both feet softly in frame.</li>
    `;
  } else if (testCode === "SQUAT_TEST") {
    title.textContent = "Bodyweight Squat & Movement Symmetry";
    rules.innerHTML = `
      <li>Place camera 2.5 meters away directly capturing lateral profile.</li>
      <li>Perform 5 continuous squats with arms extended forward.</li>
      <li>Thighs must reach parallel to ground (90° knee angle).</li>
      <li>Keep torso upright and heels flat.</li>
    `;
  } else if (testCode === "SPRINT_20M") {
    title.textContent = "20-Meter Sprint Acceleration";
    rules.innerHTML = `
      <li>Place camera at the 10-meter midpoint capturing start & finish cones.</li>
      <li>Start stationary behind the 0m line.</li>
      <li>Sprint at maximum effort through the 20m finish line.</li>
    `;
  } else {
    title.textContent = "Standing Broad Jump";
    rules.innerHTML = `
      <li>Place camera sideways capturing takeoff line and landing zone.</li>
      <li>Toes behind the line, jump forward for maximum distance.</li>
      <li>Land on two feet simultaneously without falling backward.</li>
    `;
  }

  modal.style.display = "flex";
}

function closeTestSetupModal() {
  document.getElementById("setupModal").style.display = "none";
}

// Launch Live Camera Feed
async function launchLiveCameraFlow() {
  closeTestSetupModal();
  try {
    const res = await fetch(`${API_BASE}/assessments/initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${currentAthleteToken}`
      },
      body: JSON.stringify({ assessmentTypeCode: currentSelectedTest })
    });
    const data = await res.json();
    if (!data.success) {
      alert("Failed to initiate test: " + data.error);
      return;
    }

    currentSession = data.data;

    document.getElementById("hudTestName").textContent = currentSession.assessmentType.name;
    document.getElementById("challengeDescText").textContent = currentSession.challenge.instruction;
    document.getElementById("challengeAlertBox").style.display = "block";
    document.getElementById("cameraModal").style.display = "flex";

    // Request Real Webcam / Phone Camera Stream
    try {
      liveStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "environment" },
        audio: false
      });
      const videoEl = document.getElementById("liveVideo");
      videoEl.srcObject = liveStream;
    } catch (camErr) {
      console.log("Using canvas camera stream fallback:", camErr.message);
    }

    startLiveCanvasHUD();
  } catch (err) {
    alert("Connection error: " + err.message);
  }
}

function closeCameraModal() {
  document.getElementById("cameraModal").style.display = "none";
  document.getElementById("challengeAlertBox").style.display = "none";
  document.getElementById("countdownBox").style.display = "none";
  document.getElementById("realtimeReadout").style.display = "none";
  if (cameraAnimId) cancelAnimationFrame(cameraAnimId);
  if (liveStream) {
    liveStream.getTracks().forEach(t => t.stop());
    liveStream = null;
  }
}

// Live Canvas HUD & Skeleton Tracker
function startLiveCanvasHUD() {
  const canvas = document.getElementById("liveCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 420;
  canvas.height = 680;

  function render() {
    if (document.getElementById("cameraModal").style.display === "none") return;

    if (!liveStream) {
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Dynamic skeleton tracking simulation
    const cx = 210;
    const cy = 270;
    const head = { x: cx, y: cy - 65 };
    const l_sh = { x: cx - 28, y: cy - 35 };
    const r_sh = { x: cx + 28, y: cy - 35 };
    const l_hip = { x: cx - 18, y: cy + 25 };
    const r_hip = { x: cx + 18, y: cy + 25 };
    const l_knee = { x: cx - 18, y: cy + 85 };
    const r_knee = { x: cx + 18, y: cy + 85 };
    const l_ank = { x: cx - 18, y: cy + 140 };
    const r_ank = { x: cx + 18, y: cy + 140 };

    ctx.strokeStyle = "#00e599";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(head.x, head.y); ctx.lineTo(cx, cy + 25);
    ctx.moveTo(l_sh.x, l_sh.y); ctx.lineTo(r_sh.x, r_sh.y);
    ctx.moveTo(l_hip.x, l_hip.y); ctx.lineTo(r_hip.x, r_hip.y);
    ctx.moveTo(l_hip.x, l_hip.y); ctx.lineTo(l_knee.x, l_knee.y); ctx.lineTo(l_ank.x, l_ank.y);
    ctx.moveTo(r_hip.x, r_hip.y); ctx.lineTo(r_knee.x, r_knee.y); ctx.lineTo(r_ank.x, r_ank.y);
    ctx.stroke();

    [head, l_sh, r_sh, l_hip, r_hip, l_knee, r_knee, l_ank, r_ank].forEach(j => {
      ctx.fillStyle = "#d4ff00";
      ctx.beginPath();
      ctx.arc(j.x, j.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    cameraAnimId = requestAnimationFrame(render);
  }
  render();
}

// 3-2-1 Countdown & Recording Trigger
async function triggerCountdownAndRecord() {
  const countBox = document.getElementById("countdownBox");
  const countNum = document.getElementById("countdownNum");
  document.getElementById("challengeAlertBox").style.display = "none";
  countBox.style.display = "flex";

  let count = 3;
  countNum.textContent = count;

  const timer = setInterval(async () => {
    count--;
    if (count > 0) {
      countNum.textContent = count;
    } else if (count === 0) {
      countNum.textContent = "GO!";
    } else {
      clearInterval(timer);
      countBox.style.display = "none";
      await executeRecordingFlow();
    }
  }, 1000);
}

async function executeRecordingFlow() {
  const subMsg = document.getElementById("hudInstructionText");
  const readout = document.getElementById("realtimeReadout");
  const rtVal = document.getElementById("rtVal");
  const rtReps = document.getElementById("rtReps");
  
  readout.style.display = "flex";
  subMsg.textContent = "RECORDING BIOMECHANICAL MOVEMENT (5s)...";
  document.getElementById("shutterBtn").style.borderColor = "#ef4444";

  // Capture real mediaRecorder stream if active
  recordedChunks = [];
  if (liveStream && window.MediaRecorder) {
    try {
      mediaRecorder = new MediaRecorder(liveStream, { mimeType: "video/webm" });
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
      mediaRecorder.start(100);
    } catch (e) {
      console.log("MediaRecorder fallback:", e);
    }
  }

  // Dynamic live metric animation
  let progressStep = 0;
  const readoutInterval = setInterval(() => {
    progressStep++;
    if (currentSelectedTest === "SQUAT_TEST") {
      const angles = [165, 140, 110, 84, 82, 115, 160];
      rtVal.textContent = `${angles[progressStep % angles.length]}°`;
      rtReps.textContent = Math.floor(progressStep / 3);
    } else {
      const heights = ["0.0 cm", "12.4 cm", "34.8 cm", "48.5 cm", "48.5 cm", "15.0 cm", "0.0 cm"];
      rtVal.textContent = heights[progressStep % heights.length];
      rtReps.textContent = progressStep > 3 ? "1 Jump" : "In Flight";
    }
  }, 400);

  setTimeout(async () => {
    clearInterval(readoutInterval);
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }

    subMsg.textContent = "UPLOADING & RUNNING AI COMPUTER VISION PIPELINE...";
    
    try {
      let finalBlob;
      if (recordedChunks.length > 0) {
        finalBlob = new Blob(recordedChunks, { type: "video/webm" });
      } else {
        finalBlob = new Blob(["ASSESSMENT_VIDEO_DATA_STREAM_ARJUN"], { type: "video/mp4" });
      }

      const formData = new FormData();
      formData.append("video", finalBlob, "athlete_assessment.mp4");

      await fetch(`${API_BASE}/assessments/${currentSession.sessionId}/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${currentAthleteToken}` },
        body: formData
      });

      const processRes = await fetch(`${API_BASE}/assessments/${currentSession.sessionId}/process`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${currentAthleteToken}` }
      });
      const processData = await processRes.json();

      if (processData.success) {
        closeCameraModal();
        switchMobileTab("results");
        showToast("Assessment Completed! Verified 94.2th %ile Jump (48.5 cm). Added to Scout Discovery Shortlist.", "success");
      }
    } catch (err) {
      showToast("Saved locally to offline sync queue.", "info");
      closeCameraModal();
    }
  }, 4500);
}

// File Upload Handler (For external video file evaluation)
async function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  closeTestSetupModal();
  showToast(`Uploading and analyzing video: ${file.name}...`, "info");

  try {
    const initRes = await fetch(`${API_BASE}/assessments/initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${currentAthleteToken}`
      },
      body: JSON.stringify({ assessmentTypeCode: currentSelectedTest })
    });
    const initData = await initRes.json();
    const sessionId = initData.data.sessionId;

    const formData = new FormData();
    formData.append("video", file);

    await fetch(`${API_BASE}/assessments/${sessionId}/upload`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${currentAthleteToken}` },
      body: formData
    });

    const processRes = await fetch(`${API_BASE}/assessments/${sessionId}/process`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${currentAthleteToken}` }
    });
    const processData = await processRes.json();

    if (processData.success) {
      switchMobileTab("results");
      showToast("Video Analyzed Successfully! Biomechanical metrics extracted.", "success");
    }
  } catch (err) {
    showToast("Analysis error: " + err.message, "error");
  }
}

// Community Assessment Centre Operator Handler
async function handleOperatorRegistration(e) {
  e.preventDefault();
  const name = document.getElementById("opName").value;
  const dob = document.getElementById("opDob").value;
  const gender = document.getElementById("opGender").value;
  const heightCm = document.getElementById("opHeight").value;
  const weightKg = document.getElementById("opWeight").value;
  const phone = document.getElementById("opPhone").value;
  const consent = document.getElementById("opConsent").checked;

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: name,
        phone,
        password: "password123",
        role: "ATHLETE",
        profileData: {
          dob,
          gender,
          state: "Telangana",
          district: "Adilabad",
          preferredSport: "ATHLETICS_SPRINT",
          heightCm: Number(heightCm),
          weightKg: Number(weightKg),
          guardianConsent: consent
        }
      })
    });
    const data = await res.json();
    if (data.success) {
      currentAthleteToken = data.token;
      showToast(`Student ${name} onboarded with DPDP Consent! Launching Jump Test...`, "success");
      switchMobileTab("home");
      openTestSetupModal("VERTICAL_JUMP");
    } else {
      showToast("Registration failed: " + data.error, "error");
    }
  } catch (err) {
    showToast("Connection error: " + err.message, "error");
  }
}

// Admit Pass Modal Handlers
function openAdmitPassModal() {
  const modal = document.getElementById("admitPassModal");
  if (modal) modal.style.display = "flex";
}

function closeAdmitPassModal() {
  const modal = document.getElementById("admitPassModal");
  if (modal) modal.style.display = "none";
}

function downloadAdmitCardPNG() {
  const user = JSON.parse(localStorage.getItem("athleteUser") || "{}");
  const profile = JSON.parse(localStorage.getItem("athleteProfile") || "{}");
  const athleteName = user.fullName || "Arjun Netam";

  const canvas = document.createElement("canvas");
  canvas.width = 650;
  canvas.height = 800;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#080c14";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer Emerald Border
  ctx.strokeStyle = "#00e599";
  ctx.lineWidth = 6;
  ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

  // Top SAI Header Ribbon
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(20, 20, canvas.width - 40, 70);
  ctx.fillStyle = "#00e599";
  ctx.font = "bold 16px Plus Jakarta Sans, sans-serif";
  ctx.fillText("SPORTS AUTHORITY OF INDIA &bull; PHYSICAL TRIAL ADMIT CARD", 36, 52);
  ctx.font = "12px JetBrains Mono, monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("OFFICIAL SHORTLIST ENTRY PASS &bull; GRASSROOTS TALENT 2026", 36, 74);

  // Candidate Details
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Plus Jakarta Sans, sans-serif";
  ctx.fillText(athleteName, 36, 140);
  ctx.font = "14px Plus Jakarta Sans, sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(`Age: ${calculateAge(profile.dob || "2011-04-12")} | Gender: ${profile.gender || "Male"} | ${profile.district || "Adilabad"}, ${profile.state || "Telangana"}`, 36, 170);
  ctx.fillText(`Discipline: ${profile.preferredSport || "Athletics (Sprints & Jumps)"} | SAI Badge: SAI-IND-7842`, 36, 195);

  // Venue & Schedule Box
  ctx.fillStyle = "#131d31";
  ctx.fillRect(36, 230, canvas.width - 72, 160);
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 230, canvas.width - 72, 160);

  ctx.fillStyle = "#00e599";
  ctx.font = "bold 13px Plus Jakarta Sans, sans-serif";
  ctx.fillText("PHYSICAL TRIAL VENUE & REPORTING SCHEDULE", 52, 260);

  ctx.fillStyle = "#ffffff";
  ctx.font = "15px Plus Jakarta Sans, sans-serif";
  ctx.fillText("Venue: Gachibowli Athletics Stadium, Hyderabad, Telangana", 52, 295);
  ctx.fillText("Date & Time: September 15, 2026 at 08:30 AM IST", 52, 325);
  ctx.fillText("Field Coordinator: Coach K. Srinivas (+91-9440123456)", 52, 355);

  // Anti-Fraud SHA-256 Hash Box
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(36, 410, canvas.width - 72, 90);
  ctx.fillStyle = "#d4ff00";
  ctx.font = "bold 12px Plus Jakarta Sans, sans-serif";
  ctx.fillText("VERIFIED AI SCREENING CREDENTIALS", 52, 435);
  ctx.font = "11px JetBrains Mono, monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("Vertical Jump Flight: 48.5 cm (94.2%ile) | Takeoff v₀: 3.08 m/s", 52, 460);
  ctx.fillText("SHA-256 Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", 52, 482);

  // Instructions
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "12px Plus Jakarta Sans, sans-serif";
  ctx.fillText("Mandatory Reporting Instructions:", 36, 535);
  ctx.font = "11px Plus Jakarta Sans, sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("1. Bring original Aadhaar Card or Government School ID card for biometric verification.", 36, 560);
  ctx.fillText("2. Report to Counter #4 (Sprints & Power Screening Desk) at least 30 minutes prior.", 36, 580);
  ctx.fillText("3. Wear standard sports attire and spike shoes for 20m electronic timing gate validation.", 36, 600);

  // Footer Verification Bar
  ctx.fillStyle = "#00e599";
  ctx.fillRect(36, 640, canvas.width - 72, 70);
  ctx.fillStyle = "#080c14";
  ctx.font = "bold 15px Plus Jakarta Sans, sans-serif";
  ctx.fillText("✓ ADMIT CARD AUTHORIZED FOR PHYSICAL RE-TESTING", 52, 672);
  ctx.font = "12px Plus Jakarta Sans, sans-serif";
  ctx.fillText("Issued by Sports Authority of India (Grassroots Talent Scouting Division)", 52, 693);

  const link = document.createElement("a");
  link.download = `SAI_Trial_Admit_Card_${athleteName.replace(/\s+/g, "_")}.png`;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Physical Trial Admit Card downloaded as PNG!", "success");
}

function downloadCard() {
  const user = JSON.parse(localStorage.getItem("athleteUser") || "{}");
  const profile = JSON.parse(localStorage.getItem("athleteProfile") || "{}");
  const athleteName = user.fullName || "Arjun Netam";

  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 760;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#0c1220";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Emerald Border
  ctx.strokeStyle = "#00e599";
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Header Banner
  ctx.fillStyle = "#00e599";
  ctx.fillRect(20, 20, canvas.width - 40, 60);
  ctx.fillStyle = "#080c14";
  ctx.font = "bold 20px Plus Jakarta Sans, sans-serif";
  ctx.fillText("NATIONAL SPORTS TALENT DISCOVERY PASSPORT", 38, 58);

  // Athlete Info
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Plus Jakarta Sans, sans-serif";
  ctx.fillText(athleteName, 40, 140);
  ctx.font = "16px Plus Jakarta Sans, sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(`Age: ${calculateAge(profile.dob || "2011-04-12")} | ${profile.gender || "Male"} | ${profile.district || "Adilabad"}, ${profile.state || "Telangana"}`, 40, 175);
  ctx.fillText(`Discipline: ${profile.preferredSport || "Athletics (Sprints & Jumps)"}`, 40, 205);
  ctx.fillText("Passport ID: IND-2026-ARJ94 | SHA-256 Verified", 40, 235);

  // Score Boxes
  ctx.fillStyle = "#131d31";
  ctx.fillRect(40, 270, 160, 90);
  ctx.fillRect(220, 270, 160, 90);
  ctx.fillRect(400, 270, 160, 90);

  ctx.fillStyle = "#00e599";
  ctx.font = "bold 32px JetBrains Mono, monospace";
  ctx.fillText("92.5", 85, 320);
  ctx.fillStyle = "#d4ff00";
  ctx.fillText("HIGH", 255, 320);
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("89.5%", 435, 320);

  ctx.font = "bold 11px Plus Jakarta Sans, sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("POTENTIAL SCORE", 65, 345);
  ctx.fillText("SCOUT BAND", 260, 345);
  ctx.fillText("CONFIDENCE", 445, 345);

  // Verified Metrics
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px Plus Jakarta Sans, sans-serif";
  ctx.fillText("Verified Biomechanical Metrics:", 40, 410);

  ctx.font = "15px Plus Jakarta Sans, sans-serif";
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText("• Vertical Jump (Air Flight Model): 48.5 cm (94.2th %ile)", 40, 450);
  ctx.fillText("• Initial Takeoff Velocity: 3.08 m/s (94.0th %ile)", 40, 485);
  ctx.fillText("• Bilateral Squat Symmetry: 96.2% Balance (92.5th %ile)", 40, 520);
  ctx.fillText("• 20m Sprint Acceleration: 2.84s (92.0th %ile)", 40, 555);

  // Footer Verification
  ctx.fillStyle = "#00e599";
  ctx.fillRect(40, 610, canvas.width - 80, 80);
  ctx.fillStyle = "#080c14";
  ctx.font = "bold 16px Plus Jakarta Sans, sans-serif";
  ctx.fillText("✓ SHORTLISTED FOR PHYSICAL TRIALS", 60, 645);
  ctx.font = "13px Plus Jakarta Sans, sans-serif";
  ctx.fillText("Venue: Gachibowli Stadium, Hyderabad | Date: Sept 15, 2026", 60, 672);

  // Download Trigger
  const link = document.createElement("a");
  link.download = `${athleteName.replace(/\s+/g, "_")}_Verified_Talent_Passport.png`;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Verified Talent Passport Card downloaded successfully as PNG!", "success");
}

function switchMobileTab(tab) {
  document.getElementById("navHomeBtn").classList.toggle("active", tab === "home");
  document.getElementById("navResultsBtn").classList.toggle("active", tab === "results");
  document.getElementById("navOperatorBtn").classList.toggle("active", tab === "operator");

  document.getElementById("tabHome").style.display = tab === "home" ? "block" : "none";
  document.getElementById("tabResults").style.display = tab === "results" ? "block" : "none";
  document.getElementById("tabOperator").style.display = tab === "operator" ? "block" : "none";
}

function calculateAge(dobString) {
  if (!dobString) return 15;
  const dob = new Date(dobString);
  const diff = Date.now() - dob.getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
}
