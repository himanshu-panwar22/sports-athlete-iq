# Sports Talent AI — Democratizing Grassroots Sports Scouting (SIH Edition)

> **Platform Philosophy:**  
> *"AI assists talent discovery. AI does not make the final selection."*  
> **Scouting Funnel:**  
> $\text{Athlete Anywhere} \longrightarrow \text{Standardized Test} \longrightarrow \text{AI Kinematics \& Anti-Cheat} \longrightarrow \text{Cohort Benchmarking} \longrightarrow \text{Human Scout Validation} \longrightarrow \text{Physical Trial}$

---

## 1. Quick Start Guide

### 1.1 Launch All Services
```bash
# 1. Install dependencies (Node 18+ and Python 3.10+)
cd sports-talent-ai
node scripts/start_all.js
```

### 1.2 Access Live Portals
* 🌟 **Scout & Institutional Discovery Portal:** [`http://localhost:3000`](http://localhost:3000)
* 📱 **Athlete & Operator Mobile Portal:** [`http://localhost:5000`](http://localhost:5000)
* ⚙️ **Core Backend REST API:** [`http://localhost:4000/api/v1`](http://localhost:4000/api/v1)
* 🤖 **AI & Computer Vision Microservice:** [`http://localhost:8000/api/v1/cv/health`](http://localhost:8000/api/v1/cv/health)

---

## 2. Automated Test Execution

```bash
# 1. Run Foundation & Equation Sanity Checks
node scripts/verify_environment.js

# 2. Run Backend REST API & DPDP Act Compliance Tests (11 tests)
node backend/tests/api.test.js

# 3. Run Computer Vision Kinematics Python Tests (9 tests)
python ai-service/tests/test_kinematics.py

# 4. Run End-to-End Programmatic Live Demo Flow (7 scenes)
node scripts/demo_e2e_flow.js
```

---

## 3. Project Architecture

```
sports-talent-ai/
├── backend/                       # Node.js / Express Core REST API (Port 4000)
│   ├── src/                       # JWT Auth, DPDP Minor Consent, Session Orchestrator, Storage
│   └── tests/api.test.js          # 11 automated integration tests
│
├── ai-service/                    # Python / FastAPI Computer Vision Microservice (Port 8000)
│   ├── app/                       # MediaPipe Pose, One-Euro Filter, ArUco Calibrator, Kinematics
│   └── tests/test_kinematics.py   # 9 Python kinematics unit tests
│
├── scout-dashboard/               # Scout Discovery Web Portal (Port 3000)
│   └── public/                    # Multi-filter grid, animated skeleton canvas player, trial triage
│
├── mobile-app/                    # Athlete & Operator Mobile Portal (Port 5000)
│   └── public/                    # Pre-flight camera HUD, anti-cheat challenge, operator mode
│
├── database/                      # PostgreSQL DDL Schemas & Adolescent Benchmark Seeds
├── docs/                          # Architecture, AI Methodology, Privacy, API specs, Demo script
├── docker-compose.yml             # Containerized orchestration
└── scripts/                       # Startup, verification, and synthetic generator utilities
```

---

## 4. Key Innovations

1. **Physics-Based Gravity Kinematics for Jumps:** Computes vertical leap from air flight time ($h = \frac{1}{8} g \Delta t^2$), ensuring focal-length invariance.
2. **Adaptive One-Euro Temporal Smoothing:** Attenuates landmark jitter from budget smartphone cameras without introducing lag during rapid movement.
3. **Optical ArUco Scale Calibration:** Replaces arbitrary pixel estimations with real-world metric centimeters ($S_{\text{cm/px}}$).
4. **Anti-Cheat Dynamic Gesture Verification:** Generates a randomized motion challenge in the first 3 seconds to prevent pre-recorded video fraud.
5. **DPDP Act 2023 Minor Protection:** Enforces mandatory verified guardian consent for athletes under 18.
6. **Community Assessment Centre Mode:** Enables a single device to sequentially assess rural school cohorts without requiring personal smartphone ownership.

---

## 5. Documentation Links
* 📐 [Full Architecture Document](docs/architecture.md)
* 🧠 [AI & Biomechanical Methodology](docs/ai-methodology.md)
* 🔒 [Privacy & DPDP Act Compliance](docs/privacy.md)
* 📡 [REST API Specification](docs/api.md)
* 🎤 [SIH Presentation Pitch & Judge Defense](docs/demo-script.md)
* 📊 [SIH Slide Deck](docs/sih-presentation-deck.md)
