# Privacy, Governance & DPDP Act 2023 Compliance Architecture

## 1. Compliance with India's Digital Personal Data Protection (DPDP) Act 2023

Grassroots sports assessment handles biometric movement data, geolocation, and videos of adolescent athletes. The platform is designed from the ground up to comply strictly with the DPDP Act 2023.

---

## 2. Minor Athlete Protection & Verified Guardian Consent
Under Section 9 of the DPDP Act 2023:
* Processing personal data of minors ($< 18$ years) requires **verifiable parental or lawful guardian consent**.
* The platform automatically calculates age from `dob`. If $\text{Age} < 18$:
  1. The registration endpoint blocks submission unless `guardianConsent === true`, `guardianName`, and `guardianPhone` are present.
  2. School and Community Assessment Centre mode allows the school Headmaster / District Sports Officer to act as verified institutional guardian with written consent on file.

```
Age Calculation: $\text{Age} = \text{CurrentYear} - \text{BirthYear}$
If $\text{Age} < 18 \land \text{guardianConsent} == \text{false} \implies \text{HTTP 400 REJECTED}$
```

---

## 3. Video Storage & Access Isolation
* **Zero Public URLs:** Assessment videos are **never** stored in public storage buckets.
* **Signed Ephemeral URLs:** Video streams are accessible exclusively through 15-minute time-limited HMAC-signed URLs or role-restricted API endpoints.
* **Role-Based Access Control (RBAC):**
  * **Athletes:** Can access only their own recorded assessments and results.
  * **Scouts:** Can access only shortlisted candidate evidence within authorized sport disciplines and geographic zones.
  * **Operators:** Can view only athletes registered during their active session.

---

## 4. Cryptographic SHA-256 Video Fingerprinting
Every uploaded video is immediately fingerprinted with an immutable SHA-256 hash.
* Prevents video tampering and splicing.
* Detects duplicate video uploads across multiple athlete accounts.
* Serves as proof of immutable attempt timestamp during physical trial verification.

---

## 5. Right to Erasure & Data Retention Lifecycle
* Athletes and legal guardians have the right to request deletion of raw video files at any time through the profile interface.
* Extracted numerical kinematics (e.g. flight time, jump height, symmetry percentage) can be retained in anonymized form for longitudinal cohort benchmark recalibration without storing face or raw video footage.
