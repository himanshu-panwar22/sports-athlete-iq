# Complete System Architecture: AI-Assisted Sports Talent Discovery Platform

## 1. System Overview & Philosophy
The **AI-Assisted Sports Talent Discovery Platform** serves as an inclusive digital scouting and screening infrastructure across Indian grassroots sports.

> **Foundational Principle:**  
> *"AI assists talent discovery. AI does not make the final selection."*  
> **Scouting Funnel:**  
> $\text{Athlete} \longrightarrow \text{Standardized Test} \longrightarrow \text{AI Verification} \longrightarrow \text{Cohort Benchmarking} \longrightarrow \text{Human Scout Validation} \longrightarrow \text{Physical Trial}$

---

## 2. High-Level Architecture (C4 Model)

```
                 ┌────────────────────────────────────────────────────────┐
                 │                   Client Presentation                  │
                 │                                                        │
                 │  ┌────────────────────────┐  ┌──────────────────────┐  │
                 │  │ Athlete Mobile Portal  │  │ Scout Web Dashboard  │  │
                 │  │ (Port 5000 / React/JS) │  │ (Port 3000 / Next/JS)│  │
                 │  └───────────┬────────────┘  └──────────┬───────────┘  │
                 └──────────────┼──────────────────────────┼──────────────┘
                                │ HTTPS (REST / Multipart) │
                                ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Core Backend API (Port 4000)                                  │
│                                                                                                 │
│   ┌────────────────────┐   ┌────────────────────────┐   ┌───────────────────────────────────┐   │
│   │   Auth & RBAC      │   │  DPDP Minor Consent    │   │  Assessment Session Orchestrator  │   │
│   │  (JWT + bcrypt)    │   │  (Age < 18 Guardian)   │   │  (Dynamic Anti-Cheat Challenges)  │   │
│   └─────────┬──────────┘   └───────────┬────────────┘   └─────────────────┬─────────────────┘   │
│             │                          │                                  │                     │
│   ┌─────────▼──────────────────────────▼──────────────────────────────────▼─────────────────┐   │
│   │         Scout Triage Ledger, Audit Logs & Physical Trial Invitation Dispatcher          │   │
│   └────────────────────────────────────┬────────────────────────────────────────────────────┘   │
└────────────────────────────────────────┼────────────────────────────────────────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │ Asynchronous Task Queue / Webhook             │
                 ▼                                               ▼
┌───────────────────────────────────────────────┐ ┌───────────────────────────────────────────────┐
│           PostgreSQL & Object Storage         │ │       AI Computer Vision Microservice         │
│                                               │ │            (Python / FastAPI - Port 8000)     │
│  • users, athlete_profiles, assessment_types  │ │                                               │
│  • assessment_sessions, assessment_videos     │ │  • MediaPipe 33-Joint Pose Tracking           │
│  • assessment_quality, assessment_metrics     │ │  • One-Euro Adaptive Low-Pass Filter          │
│  • assessment_scores, athlete_shortlists      │ │  • ArUco Metric Scale Calibrator ($S$)        │
│  • scout_reviews, physical_trials, invites    │ │  • Kinematics: Jump Height ($h=1/8 g\Delta t^2│
│  • benchmark_cohorts, audit_logs              │ │  • Multi-Factor Confidence Formulation        │
│  • Object Storage (MinIO / S3 Video Blobs)    │ │  • Adolescent Cohort Percentile Engine        │
└───────────────────────────────────────────────┘ └───────────────────────────────────────────────┘
```

---

## 3. Subsystem Breakdown

### 3.1 Athlete & Community Operator Mobile Portal (Port 5000)
* **Pre-Flight Camera HUD:** Real-time feedback verifying distance, lighting luminance meter (minimum 70 lx), camera stability, and full-body bounding box guide.
* **Anti-Cheat Dynamic Challenge:** Generates randomized physical gestures (e.g. `RAISE_LEFT_ARM`, `TOUCH_HEAD`) required in first 3 seconds to prevent pre-recorded video fraud.
* **Offline-First Synchronization:** Local SQLite/IndexedDB queue holding un-synced assessment records until network connectivity is detected.
* **Community Assessment Centre Mode:** Allows a single smartphone or tablet at a rural government school / Panchayat centre to sequentially assess multiple students without personal phones.

### 3.2 Core Backend REST API (Port 4000)
* **DPDP Act 2023 Compliance:** Minor athlete registration requires verified parental/guardian consent before video recording is permitted.
* **Multipart Streaming with SHA-256 Checksum:** Videos are fingerprinted upon upload to ensure data integrity and detect duplicate submissions.
* **Scout Triage & Audit Decision Ledger:** Immutable tracking of scout decisions (`APPROVED_FOR_TRIAL`, `NEEDS_PHYSICAL_RETEST`, `REJECTED`).
* **Physical Trial Scheduler:** Manages regional trial venues, dates, and candidate invitation dispatches.

### 3.3 AI & Biomechanical Computer Vision Microservice (Port 8000)
* **Pose Estimation:** MediaPipe 33 landmark detection pipeline tracking joints across temporal frames.
* **One-Euro Temporal Smoothing:** Adaptive low-pass filter eliminating high-frequency landmark jitter from low-cost smartphone cameras.
* **Physical Scale Calibration:** Optical ArUco marker detection ($S_{\text{cm/px}} = \frac{\text{Width}_{\text{cm}}}{\text{Width}_{\text{px}}}$) with standing body height normalization fallback.
* **Biomechanical Kinematics Engines:**
  * **Countermovement Vertical Jump:** $h_{\text{gravity}} = \frac{1}{8} g (\Delta t)^2$, Takeoff Velocity $v_0 = \frac{1}{2} g \Delta t$.
  * **Squat Assessment:** Joint angle $\theta = \arccos\left(\frac{\vec{a} \cdot \vec{b}}{\|\vec{a}\| \|\vec{b}\|}\right)$, Repetition counter state machine, Bilateral symmetry index.
* **Multi-Factor Confidence Score:** $C = 0.25 Q_{\text{video}} + 0.35 P_{\text{vis}} + 0.20 C_{\text{calib}} + 0.20 S_{\text{cons}}$.
* **Cohort Benchmarking:** Normal CDF $\Phi(z)$ mapping raw metrics to Indian adolescent demographic percentiles (Ages 10–18, Boys & Girls).

### 3.4 Scout & Institutional Web Dashboard (Port 3000)
* **Discovery Grid:** Multi-attribute filtering (Sport, State, District, Age bracket, Min Percentile).
* **Synchronized Skeleton Overlay Player:** Video playback with HTML5 Canvas wireframe overlay, joint coordinates, and trajectory apex readouts.
* **Side-by-Side Candidate Comparison Matrix:** Head-to-head comparison of explosive leap, takeoff velocity, and bilateral balance.
* **Ethical AI & Bias Telemetry:** Live demographic fairness auditing across Gender, Rural/Urban access, and camera quality invariance.
