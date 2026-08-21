# Smart India Hackathon (SIH) — Live Presentation Pitch & Defense Script

## The 30-Second Elevator Pitch
> *"India does not lack sporting talent. India lacks the infrastructure to systematically discover every potential athlete. Our platform converts any smartphone into the first standardized screening layer of a national talent discovery funnel. Computer vision verifies attempt integrity and extracts objective biomechanical metrics against demographic cohorts. AI does not select the athlete—AI ensures promising athletes from rural India are no longer invisible to human scouts."*

---

## 3-Minute Live Judging Presentation Flow

### Step 1: The Grassroots Reality (30 seconds)
* *"Respected Judges, meet Arjun Netam, a 15-year-old sprinter from Adilabad district in rural Telangana. Arjun has never attended an expensive private sports academy and has no access to electronic timing gates. In traditional scouting, Arjun remains completely invisible because scouts cannot physically travel to every village."*

### Step 2: The Guided Smartphone Assessment (60 seconds)
* *(Open `http://localhost:5000` on screen/mobile)*
* *"Arjun opens our lightweight mobile application or is assessed by his physical education teacher using Community Centre Mode."*
* *"Notice what happens before recording: the Pre-Flight Camera HUD verifies lighting (minimum 70 lx), checks distance (3 meters), and detects full-body head-to-toe framing."*
* *"To eliminate cheating or pre-recorded uploads, the AI generates a dynamic real-time gesture challenge: 'Raise left arm above head for 2 seconds'."*
* *"Arjun performs his Countermovement Vertical Jump. The AI Computer Vision pipeline tracks 33 body landmarks, applies One-Euro temporal smoothing to eliminate phone camera jitter, and computes jump height via flight-time physics: $h = \frac{1}{8} g (\Delta t)^2$."*
* *"Within seconds: Flight Time = 0.628s $\longrightarrow$ Jump Height = 48.5 cm $\longrightarrow$ 94.2th percentile for 15-year-old boys in India. Potential Score: HIGH (89.5% confidence)."*

### Step 3: The Scout Discovery & Audit Triage (60 seconds)
* *(Switch to `http://localhost:3000`)*
* *"Now switch to the SAI Scout Discovery Dashboard. Coach Vikram filters: Telangana + Athletics + Score $\ge 80$. Arjun immediately surfaces at the top of the shortlist."*
* *"The scout doesn't receive a black-box mysterious number. Clicking 'Inspect Evidence' shows the synchronized skeleton wireframe overlay, takeoff velocity curve, and plain-English explainability reasons."*
* *"Coach Vikram clicks 'Approve for Physical Trial' and dispatches an official invitation to Gachibowli Athletics Stadium in Hyderabad."*

### Step 4: The Closing Impact (30 seconds)
* *"Previously, Arjun had zero opportunity to be seen. Today, without replacing a single coach or claiming to predict an Olympic champion, our platform gave Arjun an invitation to prove himself in person. That is how we democratize Indian sports talent discovery."*

---

## Frequently Asked Questions & Judge Defense

### Q1: "How accurate is a smartphone camera compared to force plates or timing gates?"
**Answer:** We never rely on raw pixel counts alone. We fuse physics flight-time equations ($h = \frac{1}{8} g \Delta t^2$) with optical ArUco scale calibration ($S_{\text{cm/px}}$) and One-Euro temporal smoothing filters. Most importantly, every assessment computes a multi-factor **Confidence Score**. Low-confidence tests are never ranked and require a re-test. The digital assessment is the initial screening filter; final validation occurs at physical trials.

### Q2: "How do you prevent athletes from cheating, faking, or uploading someone else's video?"
**Answer:** The platform enforces a 4-layer anti-fraud protocol:
1. **Dynamic Gesture Challenge:** A randomized gesture (e.g. `RAISE_LEFT_ARM`, `TOUCH_HEAD`) is required in the first 3 seconds of the recording session.
2. **Cryptographic SHA-256 Fingerprinting:** Prevents duplicate video uploads across multiple accounts.
3. **Temporal Optical Flow Continuity:** Rejects spliced videos with abrupt scene jumps ($>50\,\text{px}/\text{frame}$).
4. **Biomechanical Plausibility Filters:** Rejects physically impossible human feats (e.g., flight time $> 1.1\,\text{seconds}$).

### Q3: "What about rural children who do not own smartphones?"
**Answer:** We created **Community Assessment Centre Mode**. A single smartphone or tablet operated by a government school teacher, Panchayat secretary, or district coach can register and sequentially assess dozens of students with verified institutional consent.
