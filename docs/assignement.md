# Doctor Tracker — Project Specification & Assignment Requirements

**Client / Evaluator:** Ishmum Bhuiya, Care Guide BD  
**Document Analyzed:** `Fullstack_Task_Frontend_Focused_Updated.pdf`  
**Submission Deadline:** 2 days after receipt  
**Submission Requirements:**
- Reply All to original email thread
- Frontend GitHub repository link & Live URL (Vercel / Netlify)
- Backend GitHub repository link (`doctor-tracker-core`) & Live API URL (Render / Vercel / VPS)
- Credentials provided (if required for demo / admin login)
- Local development ready for live interview walk-through

---

## 1. Project Overview
**Doctor Tracker** is a secure administrative web application that allows authenticated users to manage doctors and their corresponding patients. The system focuses on:
- High performance & query optimization
- Clean, intuitive UX/UI
- Data visualization & analytics

---

## 2. Tech Stack Architecture
- **Backend (`doctor-tracker-core`)**: Node.js + Express (standalone REST API server)
- **Database**: MongoDB with Mongoose (optimized indexing & aggregation pipelines)
- **Frontend**: Next.js (separate client application with responsive design, charts & state management)
- **Communication**: RESTful API design principles with JWT authentication & validation (Zod)

---

## 3. Core Functional Requirements

### 3.1 Authentication & Authorization
- Secure login mechanism (Admin user credentials)
- JWT token authentication (HTTP-only cookies or Authorization header)
- Route guards / middleware to protect private endpoints
- Proper password hashing (`bcryptjs`)

### 3.2 Doctor Management (`/api/doctors`)
- **Doctor Attributes**:
  - `name` (String, required)
  - `specialization` (String, required, indexed)
  - `hospital` (String, required)
  - `phone` (String, required)
  - `email` (String, required, unique)
  - `createdAt` / `updatedAt` (Timestamps)
- **Capabilities**:
  - Create doctor
  - View paginated list of all doctors
  - Search doctors (by name, email, specialization, hospital)
  - Filter doctors (date-wise, specialization, etc.)
  - Paginate doctor records
  - View corresponding patients under each doctor
  - Add new patient assigned directly to a doctor
  - Remove / delete patient from a doctor's patient list

### 3.3 Patient Management (`/api/patients`)
- **Patient Attributes**:
  - `name` (String, required)
  - `age` (Number, required)
  - `gender` (Enum: Male, Female, Other)
  - `phone` (String, required)
  - `condition` / `diagnosis` (String, required, indexed for filtering)
  - `status` (Enum: Admitted, Recovered, Under Observation, Discharged)
  - `doctorId` (Reference to Doctor, indexed)
  - `admissionDate` / `registrationDate` (Date, indexed for date-range filtering)
  - `createdAt` / `updatedAt` (Timestamps)
- **Capabilities**:
  - List all patients with server-side pagination
  - Search patients (by name, phone, condition)
  - Filter patients:
    - Date-wise (registration / admission date range)
    - Patient condition / status
    - Assigned doctor
  - Edit patient information
  - Delete patient

### 3.4 Dashboard & Data Visualization (`/api/analytics` or `/api/dashboard`)
- **Key Metrics (KPI Cards)**:
  - Total Doctors count
  - Total Patients count
  - Average Patients per Doctor
  - Active / Current Patient conditions breakdown
- **Charts & Visual Insights**:
  - Patients per Doctor distribution (Bar / Column chart)
  - Date-based statistics (Timeline / Area / Line chart showing patient intake & registration trends over time)
  - Patient conditions breakdown (Pie / Donut chart)
- **Performance Focus**:
  - Native MongoDB aggregation pipelines (`$group`, `$lookup`, `$facet`, `$project`)
  - Indexed queries for instant load times

---

## 4. Performance & Engineering Best Practices
- **MongoDB Indexing**:
  - Text search indexes (`name`, `specialization`, `condition`)
  - Compound indexes for filtered pagination (e.g. `{ createdAt: -1, status: 1 }`, `{ doctorId: 1, createdAt: -1 }`)
- **API Architecture**:
  - Structured layered pattern: `controllers/`, `services/`, `models/`, `routes/`, `middlewares/`, `validations/`
  - Input validation using Zod
  - Centralized global error handling with standard error responses
  - Clean CORS & security headers (`helmet`, `cors`, `rate-limit`)
- **Seed Script**:
  - Script to populate database with realistic sample doctors and patients for immediate demonstration and testing.

---

## 5. README Mandatory Structure
The repository README must follow the standardized template:
1. **Description**: Elevator pitch for Doctor Tracker.
2. **Setup Guide**: Step-by-step installation instructions + `.env.example`.
3. **System Architecture**: High-level data flow & service interactions.
4. **Technical Decisions**: Deep dive into 2 key architectural decisions.
5. **Visual Evidence**: Screenshots of desktop & mobile UI.
