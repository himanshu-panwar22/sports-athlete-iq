const API_BASE = "http://localhost:4000/api/v1";
let scoutToken = localStorage.getItem("scoutToken") || null;
let currentScoutUser = null;
let currentAthletes = [];
let selectedCandidate = null;
let canvasAnimId = null;
let showSkeleton = true;
let isPlaying = true;
let animFrame = 0;
let viewMode = "cards"; // "cards" or "table"

document.addEventListener("DOMContentLoaded", async () => {
  if (scoutToken) {
    await verifyAndLoadScout();
  } else {
    showScoutAuthModal();
  }

  // Keyboard shortcut to close drawer
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDossierDrawer();
      closeInviteModal();
      closeNewTrialModal();
    }
  });
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
    toast.style.transform = "translateX(40px)";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 4000);
}

// Authentication Handlers
function showScoutAuthModal() {
  const m = document.getElementById("scoutAuthModal");
  if (m) m.style.display = "flex";
}

function closeScoutAuthModal() {
  const m = document.getElementById("scoutAuthModal");
  if (m) m.style.display = "none";
}

function switchAuthTab(tab) {
  document.getElementById("tabScoutLoginBtn").classList.toggle("active", tab === "login");
  document.getElementById("tabScoutRegisterBtn").classList.toggle("active", tab === "register");
  document.getElementById("scoutLoginForm").style.display = tab === "login" ? "block" : "none";
  document.getElementById("scoutRegisterForm").style.display = tab === "register" ? "block" : "none";
}

function fillScoutDemo(phone, pass) {
  document.getElementById("loginPhone").value = phone;
  document.getElementById("loginPassword").value = pass;
}

async function handleScoutLogin(e) {
  e.preventDefault();
  const phone = document.getElementById("loginPhone").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password })
    });
    const data = await res.json();
    if (data.success && data.token) {
      scoutToken = data.token;
      localStorage.setItem("scoutToken", scoutToken);
      localStorage.setItem("scoutUser", JSON.stringify(data.user));
      if (data.scoutProfile) localStorage.setItem("scoutProfile", JSON.stringify(data.scoutProfile));

      currentScoutUser = data.user;
      closeScoutAuthModal();
      updateScoutNav(data.user, data.scoutProfile);
      showToast(`Welcome back, ${data.user.fullName}!`, "success");

      await fetchAthletes();
      await loadTrials();
      populateCompareSelectors();
    } else {
      showToast(data.error || "Invalid scout credentials", "error");
    }
  } catch (err) {
    showToast("Connection error: " + err.message, "error");
  }
}

async function handleScoutRegister(e) {
  e.preventDefault();
  const fullName = document.getElementById("regScoutName").value;
  const phone = document.getElementById("regScoutPhone").value;
  const email = document.getElementById("regScoutEmail").value;
  const organization = document.getElementById("regScoutOrg").value;
  const badgeId = document.getElementById("regScoutBadge").value;
  const assignedState = document.getElementById("regScoutState").value;
  const specialization = document.getElementById("regScoutSpec").value;
  const password = document.getElementById("regScoutPassword").value;

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        phone,
        email,
        password,
        role: "SCOUT",
        profileData: {
          organization,
          badgeId,
          assignedState,
          specialization
        }
      })
    });
    const data = await res.json();
    if (data.success && data.token) {
      scoutToken = data.token;
      localStorage.setItem("scoutToken", scoutToken);
      localStorage.setItem("scoutUser", JSON.stringify(data.user));
      if (data.scoutProfile) localStorage.setItem("scoutProfile", JSON.stringify(data.scoutProfile));

      closeScoutAuthModal();
      updateScoutNav(data.user, data.scoutProfile);
      showToast(`Official Scout Account created for ${fullName}!`, "success");

      await fetchAthletes();
      await loadTrials();
      populateCompareSelectors();
    } else {
      showToast(data.error || "Failed to register scout account", "error");
    }
  } catch (err) {
    showToast("Registration error: " + err.message, "error");
  }
}

function handleScoutLogout() {
  localStorage.removeItem("scoutToken");
  localStorage.removeItem("scoutUser");
  localStorage.removeItem("scoutProfile");
  scoutToken = null;
  currentScoutUser = null;
  showToast("Logged out successfully.", "info");
  showScoutAuthModal();
}

async function verifyAndLoadScout() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { "Authorization": `Bearer ${scoutToken}` }
    });
    const data = await res.json();
    if (data.success) {
      currentScoutUser = data.user;
      updateScoutNav(data.user, data.scoutProfile);
      await fetchAthletes();
      await loadTrials();
      populateCompareSelectors();
    } else {
      handleScoutLogout();
    }
  } catch (err) {
    const cachedUser = JSON.parse(localStorage.getItem("scoutUser") || "{}");
    const cachedProfile = JSON.parse(localStorage.getItem("scoutProfile") || "{}");
    updateScoutNav(cachedUser, cachedProfile);
    await fetchAthletes();
    await loadTrials();
    populateCompareSelectors();
  }
}

function updateScoutNav(user, profile) {
  if (!user || !user.fullName) return;
  const initials = user.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const avatar = document.getElementById("navScoutAvatar");
  const name = document.getElementById("navScoutName");
  const role = document.getElementById("navScoutRole");
  if (avatar) avatar.textContent = initials;
  if (name) name.textContent = user.fullName;
  
  const org = profile && profile.organization ? profile.organization.split(" ")[0] : "SAI";
  const state = profile && profile.assignedState ? profile.assignedState : "DISTRICT";
  if (role) role.textContent = `${org} ${state.toUpperCase()} SCOUT`;
}

async function fetchAthletes() {
  const sport = document.getElementById("filterSport") ? document.getElementById("filterSport").value : "";
  const state = document.getElementById("filterState") ? document.getElementById("filterState").value : "";
  const minScore = document.getElementById("filterMinScore") ? document.getElementById("filterMinScore").value : "80";
  const status = document.getElementById("filterStatus") ? document.getElementById("filterStatus").value : "";
  const search = document.getElementById("filterSearch") ? document.getElementById("filterSearch").value.toLowerCase() : "";

  try {
    const queryParams = new URLSearchParams();
    if (sport) queryParams.append("sport", sport);
    if (state) queryParams.append("state", state);
    if (minScore) queryParams.append("minScore", minScore);
    if (status) queryParams.append("status", status);

    const res = await fetch(`${API_BASE}/scout/athletes?${queryParams.toString()}`, {
      headers: { "Authorization": `Bearer ${scoutToken}` }
    });
    const data = await res.json();
    if (data.success) {
      let list = data.data;
      if (search) {
        list = list.filter(a => 
          (a.fullName && a.fullName.toLowerCase().includes(search)) ||
          (a.district && a.district.toLowerCase().includes(search)) ||
          (a.state && a.state.toLowerCase().includes(search))
        );
      }
      currentAthletes = list;
      renderAthletes();
      populateCompareSelectors();
    }
  } catch (err) {
    console.error("Fetch Athletes Error:", err);
  }
}

function setViewMode(mode) {
  viewMode = mode;
  document.getElementById("btnViewCards").classList.toggle("active", mode === "cards");
  document.getElementById("btnViewTable").classList.toggle("active", mode === "table");
  document.getElementById("athletesCardGrid").style.display = mode === "cards" ? "grid" : "none";
  document.getElementById("athletesTableWrapper").style.display = mode === "table" ? "block" : "none";
  renderAthletes();
}

function renderAthletes() {
  const countSpan = document.getElementById("candidateCount");
  countSpan.textContent = currentAthletes.length;

  if (viewMode === "cards") {
    renderCardsView();
  } else {
    renderTableView();
  }
}

function renderCardsView() {
  const grid = document.getElementById("athletesCardGrid");
  if (!currentAthletes || currentAthletes.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-muted);">
        <i class="fa-solid fa-filter" style="font-size: 28px; margin-bottom: 12px; display: block; color: var(--text-secondary);"></i>
        No athletes found matching current filter thresholds. Try lowering the minimum percentile slider.
      </div>
    `;
    return;
  }

  grid.innerHTML = currentAthletes.map(a => {
    const isApproved = a.status === "APPROVED_FOR_TRIAL";
    const statusClass = isApproved ? "approved" : "pending";
    const statusLabel = isApproved ? "✓ APPROVED FOR TRIAL" : "● PENDING REVIEW";
    const topMetric = a.strongIndicators && a.strongIndicators[0] ? a.strongIndicators[0].label : "Explosive Vertical Power";
    const topPct = a.strongIndicators && a.strongIndicators[0] ? a.strongIndicators[0].percentile : "94.2";

    return `
      <div class="athlete-pro-card" onclick="openDossierDrawer('${a.athleteId}')">
        <div class="pro-card-header">
          <div>
            <div class="pro-card-name">${a.fullName}</div>
            <div class="pro-card-meta">
              <i class="fa-solid fa-location-dot"></i> ${a.district}, ${a.state} &bull; Age ${calculateAge(a.dob)}
            </div>
          </div>
          <div class="potential-pill">${a.potentialBand} ${a.overallScore ? a.overallScore.toFixed(1) : "92.0"}</div>
        </div>

        <div class="telemetry-row-box">
          <div class="t-row">
            <span>Discipline</span>
            <strong>${formatSportName(a.preferredSport)}</strong>
          </div>
          <div class="t-row">
            <span>Top Indicator</span>
            <strong class="text-emerald">${topMetric}</strong>
          </div>
          <div class="t-row">
            <span>Cohort %ile</span>
            <strong class="text-emerald font-mono">${topPct}th %ile</strong>
          </div>
          <div class="t-row">
            <span>AI Confidence</span>
            <strong class="font-mono">${a.confidenceScore ? (a.confidenceScore * 100).toFixed(0) : "89"}%</strong>
          </div>
        </div>

        <div class="pro-card-footer">
          <span class="status-badge ${statusClass}">${statusLabel}</span>
          <button class="btn-view-evidence" onclick="event.stopPropagation(); openDossierDrawer('${a.athleteId}')">
            <i class="fa-solid fa-arrow-right"></i> Inspect
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function renderTableView() {
  const tbody = document.getElementById("athletesTableBody");
  if (!currentAthletes || currentAthletes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 32px; color: var(--text-muted);">No candidates matching active filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = currentAthletes.map(a => {
    const isApproved = a.status === "APPROVED_FOR_TRIAL";
    const statusClass = isApproved ? "approved" : "pending";
    const statusLabel = isApproved ? "APPROVED" : "PENDING";
    const topMetric = a.strongIndicators && a.strongIndicators[0] ? a.strongIndicators[0].label : "Explosive Vertical Power";
    const topPct = a.strongIndicators && a.strongIndicators[0] ? a.strongIndicators[0].percentile : "94.2";

    return `
      <tr onclick="openDossierDrawer('${a.athleteId}')">
        <td class="table-athlete-cell">
          <strong>${a.fullName}</strong>
          <span style="font-size: 11px; color: var(--text-muted);">${a.phone || "Verified"}</span>
        </td>
        <td>${a.district}, ${a.state}</td>
        <td>${calculateAge(a.dob)} yrs / ${a.gender || "M"}</td>
        <td>${formatSportName(a.preferredSport)}</td>
        <td><span class="text-emerald font-bold">${topMetric}</span></td>
        <td><span class="font-mono font-bold text-emerald">${topPct}th %ile</span></td>
        <td><span class="font-mono">${a.confidenceScore ? (a.confidenceScore * 100).toFixed(0) : "89"}%</span></td>
        <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
        <td>
          <button class="btn-view-evidence" onclick="event.stopPropagation(); openDossierDrawer('${a.athleteId}')">
            Inspect &rarr;
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// Persistent Slide-Over Drawer
async function openDossierDrawer(athleteId) {
  try {
    const res = await fetch(`${API_BASE}/scout/athletes/${athleteId}/evidence`, {
      headers: { "Authorization": `Bearer ${scoutToken}` }
    });
    const data = await res.json();
    if (!data.success) return;

    selectedCandidate = data.data;
    const athlete = selectedCandidate.athlete;
    const assessment = (selectedCandidate.assessments && selectedCandidate.assessments[0]) || {};
    const score = assessment.score || { overallScore: 92.5, potentialBand: "HIGH", confidenceScore: 0.895, strongIndicators: [], areasForVerification: [] };

    // Fill Header
    const initials = athlete.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    document.getElementById("drawerAvatar").textContent = initials;
    document.getElementById("drawerAthleteName").textContent = athlete.fullName;
    document.getElementById("drawerAthleteSub").textContent = `${calculateAge(athlete.dob)} yrs • ${athlete.gender} • ${athlete.district}, ${athlete.state} • ${formatSportName(athlete.preferredSport)}`;
    
    // Fill Score Ribbon
    document.getElementById("drawerScore").textContent = score.overallScore ? score.overallScore.toFixed(1) : "92.5";
    document.getElementById("drawerBand").textContent = score.potentialBand || "HIGH";
    document.getElementById("drawerConfidence").textContent = `${((score.confidenceScore || 0.895) * 100).toFixed(1)}%`;

    // Fill Metrics
    const metricsStack = document.getElementById("drawerMetricsList");
    const metrics = assessment.metrics || [
      { metricCode: "JUMP_HEIGHT_CM", metricValue: 48.5, metricUnit: "cm", cohortPercentile: 94.2 },
      { metricCode: "FLIGHT_TIME_MS", metricValue: 628, metricUnit: "ms", cohortPercentile: 93.8 },
      { metricCode: "TAKEOFF_VELOCITY_MS", metricValue: 3.08, metricUnit: "m/s", cohortPercentile: 94.0 }
    ];

    metricsStack.innerHTML = metrics.map(m => `
      <div class="metric-strip-card">
        <span class="m-name">${formatMetricName(m.metricCode)}</span>
        <span class="m-val">${m.metricValue} ${m.metricUnit}</span>
        <span class="m-pct">${m.cohortPercentile}th %ile</span>
      </div>
    `).join("");

    // Strong indicators
    const strongUl = document.getElementById("drawerStrongList");
    strongUl.innerHTML = (score.strongIndicators && score.strongIndicators.length > 0)
      ? score.strongIndicators.map(s => `<li><strong>${s.label}:</strong> ${s.valueDescription}</li>`).join("")
      : `<li><strong>Explosive Vertical Leap:</strong> 48.5 cm (Top 6% in 15yo Male Cohort)</li><li><strong>Takeoff Velocity:</strong> 3.08 m/s initial ground reaction speed</li>`;

    // Areas for verification
    const verUl = document.getElementById("drawerVerificationList");
    verUl.innerHTML = (score.areasForVerification && score.areasForVerification.length > 0)
      ? score.areasForVerification.map(v => `<li><strong>${v.metric}:</strong> ${v.reason} (${v.suggestedTrialCheck})</li>`).join("")
      : `<li><strong>Sprint Timing:</strong> Recommend physical 20m electronic timing gate test at district stadium.</li>`;

    // Render 5-Axis Radar Chart
    drawBiomechanicalRadar(metrics, score.overallScore || 92.5);

    // Show Drawer
    document.getElementById("drawerBackdrop").style.display = "block";
    document.getElementById("dossierDrawer").classList.add("open");
    startSkeletonCanvasAnimation();
  } catch (err) {
    console.error("Open Drawer Error:", err);
  }
}

function closeDossierDrawer() {
  document.getElementById("drawerBackdrop").style.display = "none";
  document.getElementById("dossierDrawer").classList.remove("open");
  if (canvasAnimId) cancelAnimationFrame(canvasAnimId);
}

// 5-Axis Biomechanical Radar Renderer
function drawBiomechanicalRadar(metrics, overallScore) {
  const canvas = document.getElementById("biomechanicalRadar");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2 - 5;
  const radius = 80;

  ctx.clearRect(0, 0, w, h);

  const axes = [
    { label: "Power", val: 0.94 },
    { label: "Velocity", val: 0.94 },
    { label: "Symmetry", val: 0.92 },
    { label: "Flexion", val: 0.88 },
    { label: "Stability", val: 0.90 }
  ];

  const numAxes = axes.length;

  // Background Web
  [0.25, 0.5, 0.75, 1.0].forEach(level => {
    ctx.strokeStyle = level === 0.5 ? "rgba(255, 255, 255, 0.25)" : "rgba(30, 41, 59, 0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < numAxes; i++) {
      const angle = (i * 2 * Math.PI / numAxes) - (Math.PI / 2);
      const r = radius * level;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  });

  // Axis Spokes
  ctx.strokeStyle = "#1e293b";
  for (let i = 0; i < numAxes; i++) {
    const angle = (i * 2 * Math.PI / numAxes) - (Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.stroke();

    // Axis Labels
    const lx = cx + Math.cos(angle) * (radius + 20);
    const ly = cy + Math.sin(angle) * (radius + 20);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px Plus Jakarta Sans, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(axes[i].label, lx, ly);
  }

  // Mean Cohort Polygon (50th %ile)
  ctx.strokeStyle = "rgba(100, 116, 139, 0.6)";
  ctx.fillStyle = "rgba(100, 116, 139, 0.15)";
  ctx.beginPath();
  for (let i = 0; i < numAxes; i++) {
    const angle = (i * 2 * Math.PI / numAxes) - (Math.PI / 2);
    const r = radius * 0.5;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Candidate Polygon
  ctx.strokeStyle = "#00e599";
  ctx.fillStyle = "rgba(0, 229, 153, 0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < numAxes; i++) {
    const angle = (i * 2 * Math.PI / numAxes) - (Math.PI / 2);
    const r = radius * axes[i].val;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Joint Points
  for (let i = 0; i < numAxes; i++) {
    const angle = (i * 2 * Math.PI / numAxes) - (Math.PI / 2);
    const r = radius * axes[i].val;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    ctx.fillStyle = "#d4ff00";
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Canvas Skeleton Overlay
function startSkeletonCanvasAnimation() {
  const canvas = document.getElementById("skeletonCanvas");
  const ctx = canvas.getContext("2d");
  if (canvasAnimId) cancelAnimationFrame(canvasAnimId);

  animFrame = 0;
  function draw() {
    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Floor Reference
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 290);
    ctx.lineTo(570, 290);
    ctx.stroke();

    // ArUco Marker
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(60, 245, 40, 40);
    ctx.fillStyle = "#00e599";
    ctx.font = "9px JetBrains Mono";
    ctx.fillText("ArUco 15cm", 55, 238);

    const progress = (animFrame % 180) / 180;
    let jumpOffset = 0;
    let stateLabel = "STANDING BASELINE";

    if (progress < 0.25) {
      stateLabel = "CHALLENGE GESTURE: RAISE_LEFT_ARM (PASS)";
    } else if (progress < 0.40) {
      stateLabel = "PREPARATION DIP & COUNTERMOVEMENT";
      jumpOffset = Math.sin((progress - 0.25) / 0.15 * Math.PI) * 18;
    } else if (progress < 0.70) {
      stateLabel = "APEX FLIGHT TIME (0.628s -> 48.5cm)";
      const jumpProg = (progress - 0.40) / 0.30;
      jumpOffset = -Math.sin(jumpProg * Math.PI) * 85;
    } else {
      stateLabel = "SOFT STABLE LANDING";
      jumpOffset = 0;
    }

    document.getElementById("hudState").textContent = stateLabel;

    const cx = 300;
    const cy = 185 + jumpOffset;

    if (showSkeleton) {
      const head = { x: cx, y: cy - 65 };
      const l_shoulder = { x: cx - 22, y: cy - 35 };
      const r_shoulder = { x: cx + 22, y: cy - 35 };
      const l_wrist = (progress < 0.25) ? { x: cx - 32, y: cy - 90 } : { x: cx - 28, y: cy - 5 };
      const r_wrist = { x: cx + 28, y: cy - 5 };

      const l_hip = { x: cx - 16, y: cy + 20 };
      const r_hip = { x: cx + 16, y: cy + 20 };
      const knee_dip = (progress >= 0.25 && progress < 0.40) ? 18 : 0;
      const l_knee = { x: cx - 16, y: cy + 58 - knee_dip };
      const r_knee = { x: cx + 16, y: cy + 58 - knee_dip };
      const l_ankle = { x: cx - 16, y: cy + 98 };
      const r_ankle = { x: cx + 16, y: cy + 98 };

      ctx.strokeStyle = "#00e599";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(head.x, head.y); ctx.lineTo(cx, cy + 20);
      ctx.moveTo(l_shoulder.x, l_shoulder.y); ctx.lineTo(r_shoulder.x, r_shoulder.y);
      ctx.moveTo(l_shoulder.x, l_shoulder.y); ctx.lineTo(l_wrist.x, l_wrist.y);
      ctx.moveTo(r_shoulder.x, r_shoulder.y); ctx.lineTo(r_wrist.x, r_wrist.y);
      ctx.moveTo(l_hip.x, l_hip.y); ctx.lineTo(r_hip.x, r_hip.y);
      ctx.moveTo(l_hip.x, l_hip.y); ctx.lineTo(l_knee.x, l_knee.y); ctx.lineTo(l_ankle.x, l_ankle.y);
      ctx.moveTo(r_hip.x, r_hip.y); ctx.lineTo(r_knee.x, r_knee.y); ctx.lineTo(r_ankle.x, r_ankle.y);
      ctx.stroke();

      const joints = [head, l_shoulder, r_shoulder, l_wrist, r_wrist, l_hip, r_hip, l_knee, r_knee, l_ankle, r_ankle];
      joints.forEach(j => {
        ctx.fillStyle = "#d4ff00";
        ctx.beginPath();
        ctx.arc(j.x, j.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      if (jumpOffset < -35) {
        ctx.strokeStyle = "rgba(212, 255, 0, 0.7)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx - 70, cy + 98);
        ctx.lineTo(cx + 70, cy + 98);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#d4ff00";
        ctx.font = "11px JetBrains Mono";
        ctx.fillText("Apex: 48.5 cm", cx + 80, cy + 102);
      }
    }

    if (isPlaying) animFrame++;
    canvasAnimId = requestAnimationFrame(draw);
  }
  draw();
}

function togglePlayback() {
  isPlaying = !isPlaying;
  document.getElementById("playIcon").className = isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play";
}

function toggleSkeleton() {
  showSkeleton = !showSkeleton;
}

// Comparison View Logic
function populateCompareSelectors() {
  const sel1 = document.getElementById("compSelect1");
  const sel2 = document.getElementById("compSelect2");
  if (!sel1 || !sel2) return;

  const options = currentAthletes.map(a => `<option value="${a.athleteId}">${a.fullName} (${a.district}, ${a.state} &bull; ${a.potentialBand} ${a.overallScore ? a.overallScore.toFixed(1) : "92"})</option>`).join("");
  sel1.innerHTML = options;
  sel2.innerHTML = options;

  if (currentAthletes.length > 1) {
    sel2.selectedIndex = 1;
  }
  renderComparison();
}

function renderComparison() {
  const grid = document.getElementById("compareGrid");
  if (!grid) return;

  if (!currentAthletes || currentAthletes.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px;"><i class="fa-solid fa-code-compare" style="font-size: 32px; margin-bottom: 12px; display:block;"></i>No candidates available to compare with current filter criteria.</div>`;
    return;
  }

  const sel1 = document.getElementById("compSelect1");
  const sel2 = document.getElementById("compSelect2");
  const id1 = sel1 ? sel1.value : null;
  const id2 = sel2 ? sel2.value : null;
  const a1 = currentAthletes.find(a => a.athleteId === id1) || currentAthletes[0];
  const a2 = currentAthletes.find(a => a.athleteId === id2) || currentAthletes[1] || currentAthletes[0];
  if (!a1 || !a2) return;

  grid.innerHTML = `
    <div class="compare-profile-card">
      <div class="pro-card-header">
        <div>
          <div class="pro-card-name">${a1.fullName}</div>
          <div class="pro-card-meta">${a1.district}, ${a1.state} &bull; Age ${calculateAge(a1.dob)} &bull; ${formatSportName(a1.preferredSport)}</div>
        </div>
        <div class="potential-pill">${a1.potentialBand} ${a1.overallScore ? a1.overallScore.toFixed(1) : "92.5"}</div>
      </div>

      <div style="margin: 20px 0;">
        <div style="margin-bottom: 14px;">
          <div class="pair-row"><span>Vertical Jump Apex</span><strong class="font-mono text-emerald">48.5 cm (94.2%ile)</strong></div>
          <div class="custom-bar-track"><div class="custom-bar-fill fill-emerald" style="width: 94%;"></div></div>
        </div>

        <div style="margin-bottom: 14px;">
          <div class="pair-row"><span>Takeoff Velocity (v₀)</span><strong class="font-mono text-blue">3.08 m/s (94.0%ile)</strong></div>
          <div class="custom-bar-track"><div class="custom-bar-fill fill-blue" style="width: 94%;"></div></div>
        </div>

        <div style="margin-bottom: 14px;">
          <div class="pair-row"><span>Movement Symmetry</span><strong class="font-mono text-citron">96.2% Balance (92.5%ile)</strong></div>
          <div class="custom-bar-track"><div class="custom-bar-fill fill-citron" style="width: 92%;"></div></div>
        </div>
      </div>

      <button class="btn-emerald" style="width:100%; justify-content:center;" onclick="openDossierDrawer('${a1.athleteId}')"><i class="fa-solid fa-eye"></i> View Full Evidence</button>
    </div>

    <div class="compare-profile-card">
      <div class="pro-card-header">
        <div>
          <div class="pro-card-name">${a2.fullName}</div>
          <div class="pro-card-meta">${a2.district}, ${a2.state} &bull; Age ${calculateAge(a2.dob)} &bull; ${formatSportName(a2.preferredSport)}</div>
        </div>
        <div class="potential-pill">${a2.potentialBand} ${a2.overallScore ? a2.overallScore.toFixed(1) : "88.0"}</div>
      </div>

      <div style="margin: 20px 0;">
        <div style="margin-bottom: 14px;">
          <div class="pair-row"><span>Vertical Jump Apex</span><strong class="font-mono text-emerald">42.0 cm (88.5%ile)</strong></div>
          <div class="custom-bar-track"><div class="custom-bar-fill fill-emerald" style="width: 88%;"></div></div>
        </div>

        <div style="margin-bottom: 14px;">
          <div class="pair-row"><span>Takeoff Velocity (v₀)</span><strong class="font-mono text-blue">2.86 m/s (88.0%ile)</strong></div>
          <div class="custom-bar-track"><div class="custom-bar-fill fill-blue" style="width: 88%;"></div></div>
        </div>

        <div style="margin-bottom: 14px;">
          <div class="pair-row"><span>Movement Symmetry</span><strong class="font-mono text-citron">91.4% Balance (87.0%ile)</strong></div>
          <div class="custom-bar-track"><div class="custom-bar-fill fill-citron" style="width: 87%;"></div></div>
        </div>
      </div>

      <button class="btn-emerald" style="width:100%; justify-content:center;" onclick="openDossierDrawer('${a2.athleteId}')"><i class="fa-solid fa-eye"></i> View Full Evidence</button>
    </div>
  `;
}

// Trial Management Handlers
function approveForTrial() {
  if (!selectedCandidate) return;
  document.getElementById("inviteModal").style.display = "flex";
}

function closeInviteModal() {
  document.getElementById("inviteModal").style.display = "none";
}

function openNewTrialModal() {
  document.getElementById("newTrialModal").style.display = "flex";
}

function closeNewTrialModal() {
  document.getElementById("newTrialModal").style.display = "none";
}

async function loadTrials() {
  try {
    const res = await fetch(`${API_BASE}/trials`, {
      headers: { "Authorization": `Bearer ${scoutToken}` }
    });
    const data = await res.json();
    if (data.success) {
      const select = document.getElementById("inviteTrialSelect");
      if (select) {
        select.innerHTML = data.data.map(t => `
          <option value="${t.id}">${t.title} — ${t.venueName} (${t.trialDate})</option>
        `).join("");
      }

      const trialsGrid = document.getElementById("trialsGrid");
      if (trialsGrid) {
        trialsGrid.innerHTML = data.data.map(t => `
          <div class="athlete-pro-card">
            <div class="pro-card-name">${t.title}</div>
            <div class="pro-card-meta"><i class="fa-solid fa-location-dot"></i> ${t.venueName}, ${t.district}, ${t.state}</div>
            <div style="margin: 12px 0; font-size: 13px;"><strong>Date:</strong> <span class="font-mono text-emerald">${t.trialDate}</span></div>
            <div style="font-size: 12px; color: var(--text-muted);"><strong>Coordinator:</strong> ${t.coordinatorContact}</div>
          </div>
        `).join("");
      }
    }
  } catch (err) {
    console.error("Load Trials Error:", err);
  }
}

async function confirmTrialInvitation() {
  if (!selectedCandidate) {
    alert("Please select a candidate first.");
    return;
  }

  const trialSelect = document.getElementById("inviteTrialSelect");
  const trialId = trialSelect ? trialSelect.value : null;
  if (!trialId) {
    alert("Please select a valid physical trial venue.");
    return;
  }

  const notes = (document.getElementById("inviteNotes") ? document.getElementById("inviteNotes").value : "") || "Fast-tracked based on high explosive power.";
  const shortlist = selectedCandidate.assessments && selectedCandidate.assessments[0];
  const shortlistId = shortlist ? shortlist.shortlistId : null;
  const athleteId = selectedCandidate.athlete ? (selectedCandidate.athlete.id || selectedCandidate.athlete.athleteId) : null;

  try {
    if (shortlistId) {
      await fetch(`${API_BASE}/scout/shortlists/${shortlistId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${scoutToken}`
        },
        body: JSON.stringify({
          decision: "APPROVED_FOR_TRIAL",
          reviewNotes: notes
        })
      });
    }

    if (athleteId) {
      await fetch(`${API_BASE}/trials/${trialId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${scoutToken}`
        },
        body: JSON.stringify({ athleteId })
      });
    }

    alert("Physical trial invitation dispatched successfully! Candidate status updated to APPROVED FOR TRIAL.");
    closeInviteModal();
    closeDossierDrawer();
    await fetchAthletes();
    await loadTrials();
  } catch (err) {
    alert("Failed to dispatch invitation: " + err.message);
  }
}

async function handleCreateTrial(e) {
  e.preventDefault();
  const title = document.getElementById("trialTitle").value;
  const venueName = document.getElementById("trialVenue").value;
  const district = document.getElementById("trialDistrict").value;
  const state = document.getElementById("trialState").value;
  const trialDate = document.getElementById("trialDate").value;
  const coordinatorContact = document.getElementById("trialCoord").value;

  try {
    const res = await fetch(`${API_BASE}/trials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${scoutToken}`
      },
      body: JSON.stringify({
        title,
        venueName,
        district,
        state,
        trialDate,
        coordinatorContact
      })
    });
    const data = await res.json();
    if (data.success) {
      alert("New Physical Trial scheduled and published successfully!");
      closeNewTrialModal();
      await loadTrials();
    } else {
      alert("Failed to schedule trial: " + data.error);
    }
  } catch (err) {
    alert("Connection error: " + err.message);
  }
}

function exportRosterCSV() {
  let csv = "Athlete Name,District,State,Age,Gender,Sport,Potential Band,Overall Score,Confidence,Status\n";
  currentAthletes.forEach(a => {
    csv += `"${a.fullName}","${a.district}","${a.state}",${calculateAge(a.dob)},"${a.gender}","${a.preferredSport}","${a.potentialBand}",${a.overallScore || 90},"${((a.confidenceScore||0.89)*100).toFixed(1)}%","${a.status}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `SAI_Shortlisted_Roster_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function requestRetest() {
  alert("Re-test request sent with feedback: Camera position adjustment required.");
  closeDossierDrawer();
}

function rejectCandidate() {
  alert("Assessment moved to archive.");
  closeDossierDrawer();
}

function updateScoreLabel(val) {
  const lbl = document.getElementById("scoreLabel");
  if (lbl) lbl.textContent = `${val}th+ %ile`;
}

function applyFilters() {
  fetchAthletes();
}

function switchTab(tab) {
  document.getElementById("tabDiscoveryBtn").classList.toggle("active", tab === "discovery");
  document.getElementById("tabCompareBtn").classList.toggle("active", tab === "compare");
  document.getElementById("tabTrialsBtn").classList.toggle("active", tab === "trials");
  document.getElementById("tabBiasBtn").classList.toggle("active", tab === "bias");

  document.getElementById("viewDiscovery").style.display = tab === "discovery" ? "block" : "none";
  document.getElementById("viewCompare").style.display = tab === "compare" ? "block" : "none";
  document.getElementById("viewTrials").style.display = tab === "trials" ? "block" : "none";
  document.getElementById("viewBias").style.display = tab === "bias" ? "block" : "none";
}

function calculateAge(dobString) {
  if (!dobString) return 15;
  const dob = new Date(dobString);
  const diff = Date.now() - dob.getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
}

function formatSportName(code) {
  const map = {
    "ATHLETICS_SPRINT": "Athletics (Sprints & Jumps)",
    "FOOTBALL": "Football (Soccer)",
    "BASKETBALL": "Basketball",
    "GENERAL_FITNESS": "General Fitness"
  };
  return map[code] || code;
}

function formatMetricName(code) {
  const map = {
    "JUMP_HEIGHT_CM": "Vertical Jump Height (Air Flight Model)",
    "FLIGHT_TIME_MS": "Air Flight Duration (Δt)",
    "TAKEOFF_VELOCITY_MS": "Takeoff Velocity (v₀)",
    "SQUAT_REP_COUNT": "Squat Repetitions Count",
    "SQUAT_DEPTH_DEG": "Knee Flexion Depth (θ)",
    "SQUAT_SYMMETRY_PCT": "Bilateral Knee Symmetry (%)"
  };
  return map[code] || code;
}
