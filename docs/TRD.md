# Technical Requirements Document (TRD)
## Project: Doctor Tracker Core (Backend Standalone REST API)

| Document Version | 1.0.0 |
| :--- | :--- |
| **System** | `doctor-tracker-core` |
| **Runtime Environment** | Node.js (v18.x LTS or v20.x LTS) |
| **Language** | TypeScript / Modern ES2022 |
| **Target Infrastructure** | Render / Vercel Serverless / Docker Containers |

---

## 1. System Overview & Technology Stack

### 1.1 Core Technologies
- **Runtime & Language**: Node.js $\ge 18.0$ with TypeScript for compile-time safety and self-documenting code contracts.
- **Web Application Framework**: Express.js (v4.x) with modular router architecture.
- **Database & ODM**: MongoDB (v6.0+) with Mongoose ODM (v8.x) for strict schema typing, middleware hooks, and aggregation builder.
- **Validation Engine**: Zod for type-inferred request payload and query validation.
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) with `bcryptjs` hashing.
- **Security Middlewares**: `helmet` (HTTP headers), `cors` (origin access control), `express-rate-limit` (brute-force defense), `mongo-sanitize` (NoSQL injection prevention).
- **Logging & Monitoring**: `morgan` for HTTP request logging and structured console logging.

### 1.2 Technology Selection Rationale
| Component | Selection | Rationale vs. Alternatives |
| :--- | :--- | :--- |
| **API Framework** | Express + TypeScript | Fast, lightweight, minimal overhead; satisfies strict assignment criteria for standalone Express server while providing TypeScript enterprise typing. |
| **Database** | MongoDB Atlas | Document model naturally accommodates hierarchical medical records, flexible schemas, and rich aggregation pipelines for real-time analytics. |
| **Validation** | Zod | Runtime type validation with static TypeScript type inference eliminates dual-maintenance of DTO interfaces and validation schemas. |
| **Auth Strategy** | Stateless JWT | Eliminates server-side session memory stores, facilitating seamless horizontal scaling across serverless or containerized tiers (e.g. Render). |

---

## 2. System Architecture & Module Boundaries

The backend adheres to a strict **Layered Controller-Service-Repository Pattern**:

```
[HTTP Request]
       │
       ▼
┌───────────────────────────────┐
│     Middleware Pipeline       │  (Helmet, CORS, Rate Limit, Auth, Validation)
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│         Controllers           │  (HTTP Request/Response translation, status codes)
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│          Services             │  (Business logic, domain rules, transaction handling)
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│     Models / Repositories     │  (Mongoose schemas, indexes, aggregation pipelines)
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│       MongoDB Database        │
└───────────────────────────────┘
```

### 2.1 Directory Structure Specification
```
doctor-tracker-core/
├── docs/                      # Architectural & specification documents
├── src/
│   ├── config/                # Environment variables & DB connection
│   │   ├── db.ts              # Mongoose connection & pool configuration
│   │   └── env.ts             # Zod-validated environment schema
│   ├── constants/             # Enums, status codes, error messages
│   ├── controllers/           # HTTP handlers
│   │   ├── auth.controller.ts
│   │   ├── doctor.controller.ts
│   │   ├── patient.controller.ts
│   │   └── analytics.controller.ts
│   ├── middlewares/           # Cross-cutting concerns
│   │   ├── auth.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── rateLimiter.ts
│   ├── models/                # Mongoose models & interfaces
│   │   ├── user.model.ts
│   │   ├── doctor.model.ts
│   │   └── patient.model.ts
│   ├── routes/                # Route definitions & router chaining
│   │   ├── auth.routes.ts
│   │   ├── doctor.routes.ts
│   │   ├── patient.routes.ts
│   │   ├── analytics.routes.ts
│   │   └── index.ts
│   ├── services/              # Pure business logic
│   │   ├── auth.service.ts
│   │   ├── doctor.service.ts
│   │   ├── patient.service.ts
│   │   └── analytics.service.ts
│   ├── utils/                 # Helpers (Pagination, Aggregations, AppError)
│   │   ├── AppError.ts
│   │   ├── asyncHandler.ts
│   │   ├── apiResponse.ts
│   │   └── pagination.ts
│   ├── validations/           # Zod schemas for input validation
│   │   ├── auth.validation.ts
│   │   ├── doctor.validation.ts
│   │   └── patient.validation.ts
│   ├── seed/                  # Database seeder scripts for demo
│   │   └── seeder.ts
│   ├── app.ts                 # Express application initialization
│   └── server.ts              # Server bootstrapper & shutdown lifecycle
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 3. Performance & Database Optimization Standards

### 3.1 MongoDB Query Execution Optimization
1. **Targeted Compound Indexing**:
   - Every filter query must resolve via `IXSCAN` without performing in-memory sort or table scans.
   - Doctor compound indexes: `{ specialization: 1, createdAt: -1 }`, `{ email: 1 }` (unique).
   - Patient compound indexes: `{ doctorId: 1, createdAt: -1 }`, `{ status: 1, admissionDate: -1 }`, `{ condition: 1 }`.
2. **Text Search Efficiency**:
   - Compound text indexes on `name`, `specialization`, and `hospital` for Doctors.
   - Compound text indexes on `name`, `phone`, and `condition` for Patients.
3. **Aggregation Pipeline Standards**:
   - Early stage `$match` filtering to reduce the pipeline document working set.
   - Projection (`$project`) to only emit relevant attributes.
   - `$facet` for executing multiple analytical metrics within a single database roundtrip.
4. **Lean Querying**:
   - Use `.lean()` on all read queries where Mongoose document instance methods are unneeded to reduce memory footprint and garbage collection overhead.

---

## 4. Security & Hardening Requirements

### 4.1 Authentication & Authorization
- Passwords salted with bcrypt minimum cost factor of 10.
- JWT tokens signed with SHA-256 (`HS256`) using a cryptographically secure secret ($\ge 32$ characters).
- Token expiration set to 12 hours with immediate invalidation capability.
- Route protection middleware extracts token from `Authorization: Bearer <token>` or secure cookie.

### 4.2 Injection & DoS Defense
- `express-rate-limit`: Cap requests to 100 per 15-minute window for standard endpoints and 10 per 15-minute window for authentication endpoints.
- NoSQL Injection sanitization stripping `$` and `.` operators from incoming payload bodies and query parameters.
- Parameter pollution protection to prevent multiple conflicting query string injections.

---

## 5. Deployment & Environment Strategy

### 5.1 Environment Variables Matrix
| Variable | Description | Required | Example |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Runtime stage | Yes | `development` / `production` |
| `PORT` | Listening network port | Yes | `5000` |
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | Yes | `d3f0a...` |
| `JWT_EXPIRES_IN` | Token time-to-live | Yes | `1d` |
| `CLIENT_URL` | Allowed CORS origin (Frontend) | Yes | `http://localhost:3000,https://...vercel.app` |

### 5.2 Zero-Downtime Graceful Shutdown
The application handles `SIGTERM` and `SIGINT` signals by:
1. Ceasing acceptance of new HTTP connections.
2. Waiting for in-flight requests to conclude (timeout: 10s).
3. Gracefully closing MongoDB connection pools.
4. Terminating process with code 0.
