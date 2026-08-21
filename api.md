# Complete REST API Specification

Base URL: `http://localhost:4000/api/v1`

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates user account (`ATHLETE`, `SCOUT`, `OPERATOR`, `ADMIN`). Enforces DPDP Minor Consent if age $< 18$.
* **Request Body:**
```json
{
  "fullName": "Arjun Netam",
  "phone": "9876543220",
  "password": "password123",
  "role": "ATHLETE",
  "profileData": {
    "dob": "2011-04-12",
    "gender": "MALE",
    "state": "Telangana",
    "district": "Adilabad",
    "heightCm": 172.5,
    "weightKg": 61.0,
    "preferredSport": "ATHLETICS_SPRINT",
    "guardianName": "Shankar Netam",
    "guardianPhone": "9876543290",
    "guardianConsent": true
  }
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "fullName": "Arjun Netam", "role": "ATHLETE" },
  "athleteProfile": { "id": "...", "state": "Telangana", "district": "Adilabad" }
}
```

### `POST /auth/login`
Authenticates phone + password, returns JWT token.

---

## 2. Assessment Lifecycle Endpoints

### `GET /assessments/types`
Returns active standardized physical tests (Vertical Jump, Squat Test, 20m Sprint, Broad Jump).

### `POST /assessments/initiate`
Initializes assessment session and returns dynamic anti-cheat gesture challenge.
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:** `{ "assessmentTypeCode": "VERTICAL_JUMP" }`
* **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "sessionId": "94b027b6-786b-41f7-a72d-37e0bd7019ab",
    "sessionToken": "tok_e819fa821...",
    "challenge": {
      "type": "RAISE_LEFT_ARM",
      "instruction": "Raise your left hand high above your head for 2 seconds before starting the test."
    }
  }
}
```

### `POST /assessments/:id/upload`
Uploads raw video stream, computes SHA-256 hash, and transitions state to `UPLOADED`.
* **Request:** Multipart Form Data (`key: video`)

### `POST /assessments/:id/process`
Executes AI kinematics extraction and cohort percentile benchmarking.
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sessionId": "...",
    "status": "COMPLETED",
    "score": {
      "overallScore": 92.5,
      "potentialBand": "HIGH",
      "confidenceScore": 0.895,
      "strongIndicators": [
        { "metric": "JUMP_HEIGHT_CM", "percentile": 94.2, "label": "Explosive Vertical Power", "valueDescription": "48.5 cm (Top 6% in Cohort)" }
      ],
      "recommendedAction": "District Physical Verification Trial - Gachibowli Stadium"
    }
  }
}
```

---

## 3. Scout Discovery & Triage Endpoints

### `GET /scout/athletes`
Search & filter shortlisted talent.
* **Query Parameters:**
  * `sport`: `ATHLETICS_SPRINT`, `FOOTBALL`, `BASKETBALL`
  * `state`: `Telangana`, `Haryana`, etc.
  * `minScore`: `80`
  * `status`: `PENDING_REVIEW`, `APPROVED_FOR_TRIAL`

### `GET /scout/athletes/:id/evidence`
Retrieves detailed evidence dossier with synchronized metrics and video overlays.

### `POST /scout/shortlists/:id/review`
Submits official scout audit decision.
* **Request Body:**
```json
{
  "decision": "APPROVED_FOR_TRIAL",
  "reviewNotes": "Exceptional explosive vertical leap. Fast-track to state physical trial."
}
```

---

## 4. Physical Trial Endpoints

### `GET /trials`
Lists scheduled regional physical trials.

### `POST /trials/:id/invite`
Dispatches formal invitation to shortlisted candidate.
* **Request Body:** `{ "athleteId": "10000000-0000-0000-0000-000000000001" }`
