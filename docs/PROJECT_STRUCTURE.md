# Doctor Tracker — Project & Codebase Architecture Plan

This document establishes the production-grade file and folder structure for **Doctor Tracker**, adhering strictly to industry best practices, Clean Layered Architecture, and the requirements outlined in the Care Guide BD specification.

---

## 1. Backend Architecture: `doctor-tracker-core` (Node.js + Express + TypeScript)

The backend follows the **Layered Controller-Service-Repository Pattern** with strict separation of concerns, compile-time type safety via TypeScript, and runtime contract enforcement via Zod.

```
doctor-tracker-core/
├── .github/                              # CI/CD workflows
│   └── workflows/
│       └── ci.yml                        # Automated linting, build & test checks
├── docs/                                 # Architectural specifications & requirements
│   ├── PRD.md                            # Product Requirements Document
│   ├── TRD.md                            # Technical Requirements Document
│   ├── ARCHITECTURE.md                   # System Architecture & HLD
│   ├── DATABASE_DESIGN.md                # Schema definitions, indexes & aggregation pipelines
│   ├── USER_FLOWS.md                     # User flows & state diagrams
│   ├── LLD.md                            # Low-Level Design (DTOs, Middlewares, AppError)
│   ├── API_CONTRACTS.md                  # REST API contract specifications
│   ├── PROJECT_STRUCTURE.md              # File & folder structure guidelines (this file)
│   └── assignment.md                     # Assignment submission requirements
├── src/
│   ├── config/                           # Application configuration & connections
│   │   ├── env.ts                        # Zod-validated environment variables
│   │   └── db.ts                         # Mongoose connection pool & event listeners
│   ├── constants/                        # Global constants & enums
│   │   ├── httpStatusCodes.ts            # Standard HTTP status codes
│   │   ├── errorCodes.ts                 # Domain-specific error codes
│   │   └── roles.ts                      # User roles (admin, superadmin)
│   ├── controllers/                      # HTTP transport layer (Req/Res orchestration)
│   │   ├── auth.controller.ts            # Login, session status, logout
│   │   ├── doctor.controller.ts          # Doctor CRUD & doctor-patient relationship endpoints
│   │   ├── patient.controller.ts         # Patient master registry CRUD & filters
│   │   └── analytics.controller.ts       # Dashboard analytics & aggregation endpoints
│   ├── middlewares/                      # Express middleware pipeline
│   │   ├── auth.middleware.ts            # JWT authentication & role authorization
│   │   ├── validate.middleware.ts        # Generic Zod request validator (body, query, params)
│   │   ├── error.middleware.ts           # Centralized global error handling
│   │   ├── rateLimiter.middleware.ts     # IP-based rate limiting for DoS protection
│   │   └── notFound.middleware.ts        # 404 Route not found handler
│   ├── models/                           # Mongoose data models & index definitions
│   │   ├── user.model.ts                 # Admin user schema & bcrypt password hooks
│   │   ├── doctor.model.ts               # Doctor schema, compound & text indexes
│   │   └── patient.model.ts              # Patient schema, foreign keys & indexes
│   ├── routes/                           # Express route definitions
│   │   ├── auth.routes.ts                # /api/auth routes
│   │   ├── doctor.routes.ts              # /api/doctors routes
│   │   ├── patient.routes.ts             # /api/patients routes
│   │   ├── analytics.routes.ts           # /api/analytics routes
│   │   └── index.ts                      # Central route aggregator mounting to /api
│   ├── services/                         # Pure business logic & database operations
│   │   ├── auth.service.ts               # Credential verification & JWT generation
│   │   ├── doctor.service.ts             # Doctor queries, filters & patient binding
│   │   ├── patient.service.ts            # Patient CRUD, date & condition filtering
│   │   └── analytics.service.ts          # Single-trip MongoDB $facet aggregation pipeline
│   ├── types/                            # Global TypeScript declarations & extensions
│   │   ├── express.d.ts                  # Extends Express Request with authenticated user
│   │   └── index.ts                      # Shared types & utility types
│   ├── utils/                            # Reusable helpers & utilities
│   │   ├── AppError.ts                   # Custom operational error class
│   │   ├── asyncHandler.ts               # Higher-order wrapper eliminating try/catch boilerplate
│   │   ├── apiResponse.ts                # Standardized JSON response formatter
│   │   ├── pagination.ts                 # Generic server-side pagination calculator
│   │   └── logger.ts                     # Structured logging utility
│   ├── validations/                      # Zod validation schemas
│   │   ├── auth.validation.ts            # Login DTO validation
│   │   ├── doctor.validation.ts          # Doctor creation, query & param validation
│   │   └── patient.validation.ts         # Patient creation, update & query validation
│   ├── seed/                             # Database seed scripts for live demo & testing
│   │   ├── data/                         # Realistic mock data (doctors, patients)
│   │   │   ├── doctors.json
│   │   │   └── patients.json
│   │   └── seeder.ts                     # CLI script: `npm run seed`
│   ├── app.ts                            # Express application setup (middlewares, routes)
│   └── server.ts                         # Server entry point, port listener & graceful shutdown
├── tests/                                # Test suites
│   ├── integration/                      # API endpoint tests with supertest
│   │   ├── auth.test.ts
│   │   ├── doctor.test.ts
│   │   └── patient.test.ts
│   └── unit/                             # Business logic & utility tests
│       └── pagination.test.ts
├── .env.example                          # Environment variable template
├── .gitignore                            # Git ignore configuration
├── Dockerfile                            # Production multi-stage Docker build
├── nodemon.json                          # Dev server auto-reload configuration
├── package.json                          # Dependencies & scripts
├── tsconfig.json                         # TypeScript compiler configuration
└── README.md                             # Standardized primary technical documentation
```

---

## 2. Frontend Architecture: `doctor-tracker-client` (Next.js 14/15 App Router)

The frontend client application is designed using a **Feature-Driven Modular Architecture** inside Next.js App Router for maximum reusability, zero code clutter, and optimal rendering performance.

```
doctor-tracker-client/
├── public/                               # Static assets (logos, icons, placeholders)
├── src/
│   ├── app/                              # Next.js App Router pages & layouts
│   │   ├── (auth)/                       # Route group for unauthenticated flows
│   │   │   ├── login/
│   │   │   │   └── page.tsx              # Modern Admin Login view
│   │   │   └── layout.tsx                # Centered, distraction-free auth layout
│   │   ├── (dashboard)/                  # Route group for authenticated portal
│   │   │   ├── layout.tsx                # App shell (Sidebar, Header, Breadcrumbs)
│   │   │   ├── page.tsx                  # Analytics & Dashboard page (KPIs, Charts)
│   │   │   ├── doctors/
│   │   │   │   ├── page.tsx              # Doctors Directory (Search, Filter, Table/Grid)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx          # Doctor Profile & Assigned Patients Ledger
│   │   │   └── patients/
│   │   │       └── page.tsx              # Master Patients Registry (Multi-filter, CRUD)
│   │   ├── api/                          # Client-side Next.js route handlers (if needed)
│   │   ├── globals.css                   # Tailwind CSS base & custom design tokens
│   │   ├── layout.tsx                    # Root HTML layout with providers (Query, Auth, Toast)
│   │   └── not-found.tsx                 # Custom 404 page
│   ├── components/                       # Shared reusable UI components
│   │   ├── ui/                           # Base design primitives (Radix UI / Tailwind)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx                # Accessible Modals
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx                 # Status badges (admitted, recovered, etc.)
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx                 # Accessible table components
│   │   │   ├── skeleton.tsx              # Skeleton loading placeholders
│   │   │   └── toast.tsx                 # User feedback toasts
│   │   ├── layout/                       # Layout components
│   │   │   ├── Sidebar.tsx               # Collapsible navigation drawer
│   │   │   ├── Header.tsx                # Top navigation bar with user profile & logout
│   │   │   └── MobileNav.tsx             # Responsive mobile navigation
│   │   └── shared/                       # Composite shared components
│   │       ├── SearchInput.tsx           # Debounced search bar
│   │       ├── DateRangePicker.tsx       # Date-range calendar selector
│   │       ├── PaginationControls.tsx    # Page navigation, limit selector, counters
│   │       ├── ConfirmDialog.tsx         # Destructive action confirmation modal
│   │       └── EmptyState.tsx            # Illustrated empty search results state
│   ├── features/                         # Domain-driven feature modules
│   │   ├── analytics/                    # Analytics components
│   │   │   ├── components/
│   │   │   │   ├── KpiCardGrid.tsx       # Summary KPI metric cards
│   │   │   │   ├── PatientsPerDoctorChart.tsx # Recharts Bar/Column chart
│   │   │   │   ├── AdmissionTimelineChart.tsx # Recharts Area/Line timeline
│   │   │   │   └── ConditionDistributionChart.tsx # Recharts Donut/Pie chart
│   │   │   └── hooks/
│   │   │       └── useAnalytics.ts       # TanStack Query hook for dashboard data
│   │   ├── doctors/                      # Doctor feature module
│   │   │   ├── components/
│   │   │   │   ├── DoctorTable.tsx       # Paginated doctors table
│   │   │   │   ├── DoctorCard.tsx        # Doctor card view alternative
│   │   │   │   ├── DoctorFilterBar.tsx   # Specialty and date filters
│   │   │   │   ├── CreateDoctorModal.tsx # Add Doctor form modal
│   │   │   │   └── DoctorPatientsDrawer.tsx # Drawer showing assigned patients
│   │   │   └── hooks/
│   │   │       ├── useDoctors.ts         # Query hook with search/filter caching
│   │   │       └── useDoctorMutations.ts # Create, update, delete mutations
│   │   └── patients/                     # Patient feature module
│   │       ├── components/
│   │       │   ├── PatientTable.tsx      # Patients list with status badges
│   │       │   ├── PatientFilterBar.tsx  # Condition, status, and date filters
│   │       │   ├── CreatePatientModal.tsx # New patient modal
│   │       │   └── EditPatientModal.tsx   # Edit diagnosis/status modal
│   │       └── hooks/
│   │           ├── usePatients.ts        # Paginated patient query hook
│   │           └── usePatientMutations.ts
│   ├── lib/                              # Client utility libraries & API client
│   │   ├── api.ts                        # Axios/Fetch client with auth interceptors
│   │   ├── utils.ts                      # Class variance authority (cn utility), date formatting
│   │   └── constants.ts                  # App configuration & endpoints
│   ├── hooks/                            # Cross-cutting custom hooks
│   │   ├── useAuth.ts                    # User session, login, and logout hook
│   │   └── useDebounce.ts                # Debounce hook for instant search inputs
│   └── context/                          # Global React contexts
│       └── AuthContext.tsx               # Auth state provider
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Key Design Principles & Best Practice Rules

### 3.1 Separation of Concerns (SoC)
- **Controllers** strictly handle HTTP parsing, status codes, and formatting. They never invoke database models directly.
- **Services** encapsulate pure domain business logic. They do not depend on Express `req` or `res` objects.
- **Models** define data contracts, Mongoose schema constraints, and database indexes.

### 3.2 Single Responsibility & Reusability
- Validation schemas in `validations/` are decoupled from routing and can be reused in unit tests or client-side form validation.
- Database seeder in `seed/` allows zero-friction local onboarding and provides consistent mock data for evaluation and testing.

### 3.3 Strict Compile-time & Runtime Validation
- **Compile-time**: TypeScript strict mode (`"strict": true`, `"noImplicitAny": true`).
- **Runtime**: Zod schemas validate every incoming payload. If an invalid type, missing field, or malformed ID is supplied, the request fails before hitting business logic.

### 3.4 Query Performance & Zero In-Memory Sorting
- All queries with `.sort()` are backed by compound indexes in MongoDB.
- All high-frequency read queries utilize `.lean()` to bypass Mongoose document instance overhead.
