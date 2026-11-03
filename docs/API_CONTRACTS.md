# REST API Contracts & Endpoint Specifications
## Project: Doctor Tracker Core

| Document Version | 1.0.0 |
| :--- | :--- |
| **Base URL (Local)** | `http://localhost:5000/api` |
| **Base URL (Production)** | `https://doctor-tracker-core.onrender.com/api` |
| **Auth Scheme** | `Bearer <JWT_TOKEN>` in `Authorization` Header |

---

## 1. Authentication Endpoints

### 1.1 `POST /api/auth/login`
Authenticates an administrator and returns a signed JWT token.

- **Access**: Public
- **Request Body**:
```json
{
  "email": "admin@careguide.com",
  "password": "AdminSecurePassword123!"
}
```
- **Responses**:
  - `200 OK`:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Authentication successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": "6724a1b2c3d4e5f6a7b8c9d0",
        "name": "Care Guide Admin",
        "email": "admin@careguide.com",
        "role": "admin"
      }
    }
  }
  ```
  - `401 Unauthorized`: Invalid email or password.

---

### 1.2 `GET /api/auth/me`
Retrieves authenticated user profile.

- **Access**: Private (`Bearer <token>`)
- **Responses**:
  - `200 OK`:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "id": "6724a1b2c3d4e5f6a7b8c9d0",
      "name": "Care Guide Admin",
      "email": "admin@careguide.com",
      "role": "admin"
    }
  }
  ```

---

## 2. Doctor Management Endpoints

### 2.1 `GET /api/doctors`
Fetch paginated list of doctors with search, date-range, and specialty filters.

- **Access**: Private
- **Query Parameters**:
  - `search` (optional): Keyword search on `name`, `specialization`, `hospital`
  - `specialization` (optional): Filter by exact or regex specialization
  - `startDate` (optional, ISO date): Filter created on/after
  - `endDate` (optional, ISO date): Filter created on/before
  - `page` (optional, default: 1): Page index
  - `limit` (optional, default: 10, max: 100): Records per page
  - `sortBy` (optional, default: `createdAt`): `name` | `createdAt` | `patientCount`
  - `sortOrder` (optional, default: `desc`): `asc` | `desc`
- **Response `200 OK`**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "_id": "6724b123456789abcdef0101",
      "name": "Dr. Sarah Mitchell",
      "specialization": "Cardiology",
      "hospital": "Central Care Hospital",
      "phone": "+880 1711 000111",
      "email": "dr.sarah.mitchell@careguide.com",
      "patientCount": 12,
      "createdAt": "2026-10-15T09:30:00.000Z",
      "updatedAt": "2026-11-01T14:20:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 2.2 `POST /api/doctors`
Create a new doctor profile.

- **Access**: Private
- **Request Body**:
```json
{
  "name": "Dr. Farhan Ahmed",
  "specialization": "Neurology",
  "hospital": "City Medical University Hospital",
  "phone": "+880 1819 223344",
  "email": "dr.farhan@citymed.org"
}
```
- **Responses**:
  - `201 Created`: Returns created doctor document.
  - `409 Conflict`: If email is already registered.
  - `400 Bad Request`: Validation failure.

---

### 2.3 `GET /api/doctors/:id`
Fetch single doctor details by ID.

- **Access**: Private
- **Response `200 OK`**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "_id": "6724b123456789abcdef0101",
    "name": "Dr. Sarah Mitchell",
    "specialization": "Cardiology",
    "hospital": "Central Care Hospital",
    "phone": "+880 1711 000111",
    "email": "dr.sarah.mitchell@careguide.com",
    "patientCount": 12,
    "createdAt": "2026-10-15T09:30:00.000Z"
  }
}
```

---

### 2.4 `PUT /api/doctors/:id`
Update existing doctor details.

- **Access**: Private
- **Request Body**: Partial doctor fields (`name`, `specialization`, `hospital`, `phone`, `email`).
- **Response `200 OK`**: Updated doctor record.

---

### 2.5 `DELETE /api/doctors/:id`
Remove a doctor record.

- **Access**: Private
- **Response `200 OK`**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Doctor removed successfully"
}
```

---

### 2.6 `GET /api/doctors/:id/patients`
Fetch all patients currently attributed to a specific doctor with pagination.

- **Access**: Private
- **Query Parameters**: `page`, `limit`, `status`, `search`
- **Response `200 OK`**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "_id": "6724c987654321fedcba0202",
      "doctorId": "6724b123456789abcdef0101",
      "name": "Kamal Hossain",
      "age": 48,
      "gender": "male",
      "phone": "+880 1912 345678",
      "condition": "Hypertension & Angina",
      "status": "admitted",
      "admissionDate": "2026-10-28T08:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 2.7 `POST /api/doctors/:id/patients`
Directly enroll and attach a new patient under this doctor.

- **Access**: Private
- **Request Body**:
```json
{
  "name": "Nusrat Jahan",
  "age": 34,
  "gender": "female",
  "phone": "+880 1515 998877",
  "condition": "Arrhythmia Monitoring",
  "status": "admitted",
  "admissionDate": "2026-11-03T10:00:00.000Z"
}
```
- **Response `201 Created`**: Returns created patient document and updates `patientCount` on the doctor record.

---

### 2.8 `DELETE /api/doctors/:id/patients/:patientId`
Remove or unassign a patient from this doctor's registry.

- **Access**: Private
- **Response `200 OK`**: Patient removed/unassigned, decrementing `patientCount` on the doctor record.

---

## 3. Patient Management Endpoints

### 3.1 `GET /api/patients`
Master patient catalog with full-text search and multi-filtering.

- **Access**: Private
- **Query Parameters**:
  - `search` (optional): Keyword search on `name`, `phone`, `condition`
  - `status` (optional): `admitted` | `under_observation` | `recovered` | `discharged`
  - `condition` (optional): Clinical diagnosis category
  - `doctorId` (optional): Filter patients under a particular doctor
  - `startDate` (optional, ISO string): Filter admission date from
  - `endDate` (optional, ISO string): Filter admission date to
  - `page` (optional, default: 1): Page number
  - `limit` (optional, default: 10): Page size
- **Response `200 OK`**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "_id": "6724c987654321fedcba0202",
      "name": "Kamal Hossain",
      "age": 48,
      "gender": "male",
      "phone": "+880 1912 345678",
      "condition": "Hypertension & Angina",
      "status": "admitted",
      "admissionDate": "2026-10-28T08:00:00.000Z",
      "doctor": {
        "_id": "6724b123456789abcdef0101",
        "name": "Dr. Sarah Mitchell",
        "specialization": "Cardiology",
        "hospital": "Central Care Hospital"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 128,
    "totalPages": 13,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 3.2 `GET /api/patients/:id`
Fetch single patient record with populated doctor details.

- **Access**: Private
- **Response `200 OK`**: Full patient document.

---

### 3.3 `PUT /api/patients/:id`
Update patient clinical status, assigned doctor, or contact details.

- **Access**: Private
- **Request Body**:
```json
{
  "condition": "Post-Cardiac Stent Recovery",
  "status": "recovered",
  "phone": "+880 1912 345678"
}
```
- **Response `200 OK`**: Updated patient record.

---

### 3.4 `DELETE /api/patients/:id`
Deletes a patient record system-wide and automatically decrements associated doctor's `patientCount`.

- **Access**: Private
- **Response `200 OK`**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Patient record deleted successfully"
}
```

---

## 4. Analytics & Dashboard Endpoints

### 4.1 `GET /api/analytics/dashboard`
Returns complete dashboard metrics, KPI summary, doctor workload distribution, admission timelines, and diagnostic breakdown in a single fast MongoDB aggregation.

- **Access**: Private
- **Query Parameters**:
  - `timeframe` (optional, default: `30d`): `7d` | `30d` | `90d` | `all`
- **Response `200 OK`**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "kpis": {
      "totalDoctors": 42,
      "totalPatients": 128,
      "admittedPatients": 54,
      "underObservationPatients": 32,
      "recoveredPatients": 28,
      "dischargedPatients": 14,
      "averagePatientsPerDoctor": 3.05
    },
    "patientsPerDoctor": [
      {
        "doctorId": "6724b123456789abcdef0101",
        "doctorName": "Dr. Sarah Mitchell",
        "specialization": "Cardiology",
        "patientCount": 12
      },
      {
        "doctorId": "6724b123456789abcdef0102",
        "doctorName": "Dr. Farhan Ahmed",
        "specialization": "Neurology",
        "patientCount": 9
      }
    ],
    "admissionTimeline": [
      { "date": "2026-10-25", "admissions": 4 },
      { "date": "2026-10-26", "admissions": 7 },
      { "date": "2026-10-27", "admissions": 3 },
      { "date": "2026-10-28", "admissions": 9 },
      { "date": "2026-10-29", "admissions": 6 }
    ],
    "conditionDistribution": [
      { "condition": "Cardiology", "count": 34 },
      { "condition": "Neurology", "count": 22 },
      { "condition": "Pediatrics", "count": 18 },
      { "condition": "Orthopedics", "count": 15 },
      { "condition": "General Medicine", "count": 39 }
    ]
  }
}
```

---

## 5. Health Check Endpoint

### 5.1 `GET /api/health`
System operational status and database connection telemetry.

- **Access**: Public
- **Response `200 OK`**:
```json
{
  "status": "healthy",
  "timestamp": "2026-11-03T14:30:00.000Z",
  "database": "connected",
  "uptimeSeconds": 1420
}
```
