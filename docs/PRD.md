# Product Requirements Document (PRD)
## Project: Doctor Tracker Core & Administrative Suite

| Document Version | 1.0.0 |
| :--- | :--- |
| **Status** | Approved / In Development |
| **Product Sponsor** | Ishmum Bhuiya, Care Guide BD |
| **Target Platforms** | Web (Desktop & Tablet Optimized, Mobile Responsive) |
| **Core Architecture** | Decoupled Architecture (Next.js Frontend + Express/Node.js REST API + MongoDB) |

---

## 1. Executive Summary & Vision

### 1.1 Product Vision (Elevator Pitch)
**Doctor Tracker** is a high-performance, secure healthcare administrative intelligence platform engineered to eliminate operational friction in medical resource coordination. By coupling real-time doctor-patient mapping with optimized analytical aggregation, Doctor Tracker empowers healthcare administrators to monitor doctor workloads, track patient admissions across diagnoses, and extract actionable operational insights through sub-100ms dashboards.

### 1.2 Core Business Objectives
- **Centralized Registry**: Eliminate fragmented spreadsheets by establishing a single source of truth for doctor profiles and patient allocations.
- **Doctor-Patient Attribution**: Guarantee strict referential clarity between attending physicians and their active patients.
- **Operational Intelligence**: Deliver immediate visibility into patient distribution, doctor caseload balance, and admission trends over time.
- **Production Performance**: Ensure fluid user interactions via database indexing, compound query optimizations, and lean server-side payloads.

---

## 2. Target Audience & User Personas

### 2.1 Persona 1: Healthcare Operations Administrator ("Sarah")
- **Role**: Clinical Operations Lead at Care Guide BD.
- **Pain Points**: Overburdened doctors, lack of visibility into patient assignments, difficulty tracking admissions across specialties.
- **Needs**: Fast search across hundreds of medical staff, instant attribution of patients to doctors, one-click removal/transfer, and aggregate reporting for staffing decisions.

### 2.2 Persona 2: Medical Desk Coordinator ("Tariq")
- **Role**: Front-desk intake coordinator.
- **Pain Points**: Manual data entry errors, slow patient onboarding, ambiguous doctor availability.
- **Needs**: Streamlined patient creation under specific doctors, robust validation against invalid phone/email entries, and multi-parameter filtering (by status, date, and condition).

---

## 3. Product Scope & Feature Requirements

### 3.1 Authentication & Security (Tier 0 - Mandatory)
- **FR-AUTH-01**: Secure Administrator authentication using email and hashed passwords.
- **FR-AUTH-02**: Stateless session enforcement using JSON Web Tokens (JWT) with signature verification.
- **FR-AUTH-03**: Protected route enforcement for all mutation and query endpoints.
- **FR-AUTH-04**: Automatic credential sanitization preventing password leakage in API responses.

### 3.2 Doctor Management (Tier 1 - Core)
- **FR-DOC-01: Doctor Profile Creation**: Admin can register a doctor with `Name`, `Specialization`, `Hospital`, `Phone`, and `Email`.
- **FR-DOC-02: Paginated Doctor Directory**: Display doctor catalog with server-side pagination (default 10 per page).
- **FR-DOC-03: Multi-Parameter Search**: Instant full-text/regex search across doctor name, specialization, hospital, and email.
- **FR-DOC-04: Date & Specialty Filtering**: Filter doctors based on registration timestamp intervals and specialty categories.
- **FR-DOC-05: Associated Patient Ledger**: Query and display all patients directly assigned to a specific doctor in sub-views.
- **FR-DOC-06: Direct Patient Enrollment**: Enroll and attach a new patient directly under a chosen doctor.
- **FR-DOC-07: Patient Dissociation/Removal**: Remove or reassign a patient from a doctor's active registry.

### 3.3 Patient Management (Tier 1 - Core)
- **FR-PAT-01: Dedicated Patient Catalog**: Master registry displaying all patients system-wide with attending doctor attribution.
- **FR-PAT-02: Server-Side Pagination**: Efficient skip-limit or cursor pagination supporting large patient datasets.
- **FR-PAT-03: Multi-Attribute Search**: Search across patient name, contact number, and diagnostic condition.
- **FR-PAT-04: Advanced Multi-Filter**: Filter patients by:
  - Admission / Registration date range (`startDate` to `endDate`)
  - Health condition / Diagnosis category (e.g., Cardiology, Orthopedics, Chronic Care)
  - Admission status (`Admitted`, `Under Observation`, `Recovered`, `Discharged`)
  - Attending Doctor
- **FR-PAT-05: Patient Update**: In-place updates to patient information, clinical status, and contact details.
- **FR-PAT-06: Patient Deletion**: Soft or hard deletion with relational cleanup and doctor caseload updates.

### 3.4 Dashboard & Analytical Data Visualization (Tier 1 - Core)
- **FR-DASH-01: Key Performance Indicator (KPI) Metric Cards**:
  - Total Registered Doctors count
  - Total Active & Historical Patients count
  - Average Patient Load per Doctor
  - Active Admissions vs. Discharges
- **FR-DASH-02: Patients per Doctor Load Distribution**:
  - Visual column/bar chart comparing patient volumes across top doctors to highlight overload risks.
- **FR-DASH-03: Date-Based Admission & Registration Timeline**:
  - Interactive area/line chart illustrating patient admissions and doctor onboarding trends aggregated daily, weekly, or monthly.
- **FR-DASH-04: Diagnostic Condition Breakdown**:
  - Pie/Donut visualization categorizing patients by medical condition/specialty demand.
- **FR-DASH-05: Aggregation Optimization**:
  - All analytics computed directly inside MongoDB aggregation pipelines utilizing pipeline index acceleration.

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Performance & Latency
- **NFR-PERF-01**: Indexed search and filtered list endpoints must respond in $<150\text{ms}$ at 95th percentile under standard load.
- **NFR-PERF-02**: Complex dashboard aggregation queries must execute in $<250\text{ms}$.
- **NFR-PERF-03**: Zero UI blocking during data fetching; optimistic updates and skeleton loading states on frontend.

### 4.2 Scalability & Architecture
- **NFR-SCAL-01**: Stateless REST API architecture allowing horizontal container scaling on platforms like Render or AWS ECS.
- **NFR-SCAL-02**: Database compound indexing preventing unindexed full collection scans (`COLLSCAN`).

### 4.3 Security & Robustness
- **NFR-SEC-01**: Passwords must be hashed using `bcrypt` with salt rounds $\ge 10$.
- **NFR-SEC-02**: Strict Cross-Origin Resource Sharing (CORS) policy configured with whitelisted client domains.
- **NFR-SEC-03**: HTTP security headers enforced via `helmet`.
- **NFR-SEC-04**: DoS/brute-force defense using token-bucket rate limiting on public and auth endpoints.
- **NFR-SEC-05**: Strict payload schema validation using `Zod` before requests reach business logic.

---

## 5. Success Metrics & Verification Criteria

| Metric | Target | Method of Measurement |
| :--- | :--- | :--- |
| **API Response Time** | $\le 150\text{ms}$ (P95) | Load testing / Server timing headers |
| **Index Coverage** | 100% on search/filters | `explain("executionStats")` showing `IXSCAN` |
| **Test Coverage** | $\ge 85\%$ core paths | Jest / Supertest integration suite |
| **Lighthouse Performance** | $\ge 90$ Desktop & Mobile | Google Lighthouse audit on deployed frontend |
| **Zero Data Inconsistency** | 0 orphan patient records | Referential integrity constraints & middleware validation |
