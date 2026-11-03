# Doctor Tracker — Technical & Product Documentation Suite

Welcome to the engineering documentation suite for the **Doctor Tracker** platform.

---

## 📚 Documentation Index

| Document | Purpose | Key Contents |
| :--- | :--- | :--- |
| **[PRD.md](./PRD.md)** | Product Requirements Document | Product vision, target personas, functional requirements (Auth, Doctors, Patients, Analytics), non-functional requirements, and success metrics. |
| **[TRD.md](./TRD.md)** | Technical Requirements Document | Tech stack justifications, directory layout, performance targets, security standards, and graceful shutdown lifecycle. |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | High-Level Design & System Architecture | Component diagrams, request-response sequence diagrams, edge security perimeter, and production deployment topology. |
| **[DATABASE_DESIGN.md](./DATABASE_DESIGN.md)** | Database & Query Optimization Spec | Mermaid ERD, Mongoose schemas, compound & text index strategies, and single-trip `$facet` analytical aggregation pipelines. |
| **[USER_FLOWS.md](./USER_FLOWS.md)** | User Flows & State Diagrams | Interactive user journeys for Authentication, Doctor Management, Patient Ledger, Analytics drilldowns, and edge case recovery. |
| **[LLD.md](./LLD.md)** | Low-Level Design (LLD) | Class & module designs, middleware pipeline sequence, Zod validation DTOs, custom `AppError` architecture, and query pagination helpers. |
| **[API_CONTRACTS.md](./API_CONTRACTS.md)** | REST API Contracts & Endpoint Specs | Comprehensive request/response JSON schemas, query parameters, headers, and HTTP status codes for all public and private endpoints. |
| **[assignment.md](./assignment.md)** | Evaluation & Submission Guidelines | Direct mapping to Care Guide BD evaluation criteria, submission deliverables, and standardized README requirements. |

---

## 🚀 Architectural Principles
1. **Decoupled Architecture**: Next.js client interacts with the Node.js/Express standalone server strictly via RESTful JSON endpoints.
2. **Database Query Performance**: $O(\log N)$ compound indexing eliminating collection scans (`COLLSCAN`).
3. **Stateless Scalability**: JWT token authentication enabling horizontal scaling on cloud infrastructure (Render, Vercel).
4. **Data Integrity**: Referential linkage between doctors and patients with atomic counter updates.
