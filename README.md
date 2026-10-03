# LexiLens AI — Intelligent Legal Document Simplification & Risk Advisor

## Overview

LexiLens AI is a legal-document understanding platform designed for non-lawyers. It allows users to upload legal documents (PDF, DOCX, images), extracts and classifies the text, identifies and simplifies clauses, detects risks, and provides an AI-powered Q&A chatbot — all grounded in the uploaded document.

## Features

- **Document Upload & Extraction** — PDF, DOCX, PNG, JPG with OCR fallback for scanned PDFs
- **Document Classification** — AI-powered detection of rental agreements, loan agreements, employment contracts, insurance policies, terms & conditions, service agreements
- **Clause Extraction** — Automatic segmentation into logical clauses with category tagging
- **Plain-English Simplification** — Complex legal language converted to readable explanations
- **Hybrid Risk Detection** — Rule-based scoring engine + Gemini semantic analysis
- **Risk Scoring** — 0–100 scale with LOW / MEDIUM / HIGH / CRITICAL levels
- **Financial Impact Detection** — Identifies monetary obligations and penalties
- **Recommendations** — Actionable advice per clause, with legal disclaimer
- **AI Chatbot** — Document-grounded Q&A (not generic AI answers)
- **Multilingual Support** — English, Tamil, Hindi, Malayalam, Telugu, Kannada
- **Analysis History** — View previous documents and results
- **JWT Authentication** — Secure registration/login with role-based access
- **Admin Dashboard** — User management and system statistics

## Architecture

```
Browser → React Frontend → REST API → Spring Boot Backend
                                        ├─ Auth Service (JWT + BCrypt)
                                        ├─ Document Service (Upload, Storage)
                                        ├─ Text Extraction Service (Tika, PDFBox, Tess4J)
                                        ├─ Classification Service (Gemini)
                                        ├─ Clause Analysis Service
                                        ├─ Summary Service (Gemini)
                                        ├─ Hybrid Risk Engine (Rules + Gemini)
                                        ├─ Risk Scoring Service
                                        ├─ Recommendation Engine
                                        ├─ AI Chat Service (Gemini, document-grounded)
                                        ├─ Translation Service (Gemini)
                                        └─ Dashboard Service
                                    ↓
                              Gemini / Vertex AI (external)
                                    ↓
                              PostgreSQL
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 3.5.16, Spring Data JPA, Spring Security 6.5, Maven |
| Frontend | React 18, Vite, Tailwind CSS, Axios, React Router, Recharts |
| Database | PostgreSQL 16+ (tested against 18) |
| AI | Google Gemini API |
| Document Processing | Apache Tika 3.2.3, Apache PDFBox 3.0.8, Tess4J (Tesseract OCR) |
| Auth | JWT (jjwt), BCrypt |
| API Docs | SpringDoc OpenAPI 2.8.13 (Swagger UI) |
| Migrations | Flyway |
| Deployment | Docker, Docker Compose |

## Project Structure

```
lexilens-ai/
├── backend/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/com/lexilens/
│       ├── LexiLensApplication.java
│       ├── auth/            (controller, service, repository, entity, dto, security)
│       ├── document/        (controller, service, repository, entity, dto)
│       ├── extraction/      (PDF, DOCX, OCR services)
│       ├── classification/  (Document classification)
│       ├── analysis/        (Document analysis, clause analysis, summarization)
│       ├── risk/            (Risk engine, scoring, rules)
│       ├── ai/              (Gemini service, prompts, response parser)
│       ├── chat/            (AI chat controller, service)
│       ├── translation/     (Multilingual translation)
│       ├── dashboard/       (Dashboard summary)
│       └── common/          (exception, response, config, util)
├── frontend/
│   ├── package.json
│   ├── Dockerfile
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── context/
│       └── utils/
├── database/migrations/
├── docker-compose.yml
├── .env.example
└── README.md
```

## Database Schema

| Table | Description |
|-------|-------------|
| `users` | User accounts with email, hashed password, role |
| `documents` | Uploaded files with extracted text and processing status |
| `document_clauses` | Individual clauses with risk level/score |
| `risk_analysis` | Per-clause risk details, financial impact, recommendations |
| `analysis_results` | Document-level summary, overall risk, key findings |
| `chat_history` | User questions and AI answers per document |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/lexilens` |
| `DATABASE_USERNAME` | DB username | `postgres` |
| `DATABASE_PASSWORD` | DB password | `logs@POST26` *(local dev only — set this explicitly anywhere else)* |
| `JWT_SECRET` | Secret key for JWT signing | insecure built-in fallback — **must** be overridden in production |
| `FILE_STORAGE_PATH` | Upload directory | `./uploads` |
| `GEMINI_API_KEY` | Google Gemini API key | empty (AI features degrade gracefully) |
| `GEMINI_MODEL` | Gemini model name | `gemini-1.5-flash` |
| `LAZY_INIT` | Defer bean creation for faster dev startup | `true` (set `false` in production) |

> **Production checklist:** set `DATABASE_PASSWORD` and `JWT_SECRET` from a secret manager and
> run with `LAZY_INIT=false` so wiring errors fail at boot instead of on the first request.

See `.env.example` for a template.

## Installation

### Prerequisites

- **JDK 21 exactly.** The Maven Enforcer rule requires `[21,22)`. JDK 24+ silently breaks
  Lombok annotation processing and produces a wall of unrelated "cannot find symbol" errors.
- Node.js 18+
- PostgreSQL 16+
- Maven 3.9+
- Tesseract OCR (for image extraction, optional)

Confirm the toolchain before building:

```bash
java -version          # must report 21.x
mvn -version           # must report the same JDK 21
```

On Windows, if `java -version` reports a newer JDK, point `JAVA_HOME` at JDK 21 first:

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.11"
$env:PATH = "$env:JAVA_HOME\bin;C:\tools\maven\apache-maven-3.9.7\bin;$env:PATH"
```

### Database

Flyway owns the schema, so let it create the tables rather than importing a dump:

```sql
CREATE DATABASE lexilens;
```

On startup the app applies `backend/src/main/resources/db/migration/V1__init_schema.sql`
automatically. Hibernate runs with `ddl-auto: validate`, so schema drift fails loudly.

### Backend

```bash
cd backend
mvn clean package
```

Then start the packaged jar through the helper script, which selects JDK 21, applies
tuned JVM flags for local development, waits for readiness, and health-checks OpenAPI:

```powershell
.\scripts\run-backend.ps1
```

Backend starts at `http://localhost:8080`. Swagger UI at `http://localhost:8080/swagger-ui.html`.
Stop it with the PID echoed by the script, or `Get-Process java | Stop-Process`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at `http://localhost:5173`.

## Running with Docker

```bash
docker-compose up --build
```

Services:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

## API Documentation

All endpoints are documented via Swagger/OpenAPI at:

```
GET  http://localhost:8080/swagger-ui.html
GET  http://localhost:8080/api-docs
```

### Key Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Current user | Yes |
| POST | `/api/documents/upload` | Upload document | Yes |
| GET | `/api/documents` | List documents | Yes |
| GET | `/api/documents/{id}` | Document details + analysis | Yes |
| POST | `/api/documents/{id}/analyze` | Trigger analysis | Yes |
| DELETE | `/api/documents/{id}` | Delete document | Yes |
| GET | `/api/documents/{id}/clauses` | Get clauses | Yes |
| GET | `/api/documents/{id}/risks` | Get risk analyses | Yes |
| POST | `/api/chat` | Ask AI about document | Yes |
| GET | `/api/chat/history/{documentId}` | Chat history | Yes |
| POST | `/api/translate` | Translate text | Yes |
| GET | `/api/dashboard/summary` | Dashboard stats | Yes |

## AI Configuration

1. Obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Set `GEMINI_API_KEY` in your environment or `.env` file
3. All AI calls go through the backend — the API key is never exposed to the frontend
4. If Gemini is unavailable, the app degrades gracefully (rule-based analysis, fallback messages)

## Testing

```bash
cd backend
mvn test
```

34 tests run against an H2 in-memory database (`application-test.yml`), so no local
PostgreSQL instance is required:

| Suite | Tests | Covers |
|-------|-------|--------|
| `LexiLensApplicationTests` | 2 | Context loads, Flyway/JPA wiring is valid |
| `RiskEngineTest` | 13 | Rule matching for each risk type and severity |
| `RiskScoringServiceTest` | 11 | Weighted scoring, clamping, level thresholds |
| `AuthFlowIntegrationTest` | 8 | Register/login, authorization enforcement, principal resolution |

`AuthFlowIntegrationTest` is a deliberate regression guard for two authorization bugs that
both returned HTTP 500 instead of a proper 401:

1. `JwtAuthenticationFilter` places a `UserDetails` in the security context, so controllers
   declaring `@AuthenticationPrincipal User` (the JPA entity) received `null`. This broke
   `/api/dashboard/summary` and both `/api/chat` endpoints.
2. `SecurityConfig` permitted `/api/auth/**` wholesale, so `/api/auth/me` ran with a null
   principal when no token was supplied.

The tests assert 200 for a valid token and 401 without one, so neither bug can return
silently.

### Verifying a dependency scan actually detects problems

A scanner that reports zero findings is only meaningful if it can fail. Confirm that
before trusting a clean run:

```bash
# 1. Current stack
powershell -File scripts/scan-deps.ps1

# 2. Negative control: temporarily revert the pinned versions in backend/pom.xml
powershell -File scripts/scan-deps.ps1
```

Step 2 reports 103 advisories against 25 packages and exits non-zero. Restore the pinned
versions afterwards. `scripts/scan-deps.ps1` queries OSV.dev with the exact resolved
Maven coordinates, so it reflects what actually ships rather than what the POM requests.

The full OWASP `dependency-check` scan was removed from the build: its NVD database update
takes tens of minutes, leaves stale `odc.update.lock` files, and regularly leaves orphaned
Java processes behind. The OSV script completes in about 19 seconds and covers the same
advisory sources.

## Startup Performance

`scripts/measure-startup.ps1` runs the jar repeatedly and reports the median. On the
development machine the packaged jar went from **17.6s** (default) to **15.9s** with
startup-tuned JVM flags.

The changes behind that:

| Change | Effect |
|--------|--------|
| `-XX:TieredStopAtLevel=1` | Skips C2 JIT compilation that a short-lived process never benefits from |
| `-XX:+UseSerialGC` | Lower pause variance and no GC thread ramp-up |
| Lazy bean initialization | Defers ~35 beans until first request (~11% faster to accept traffic) |
| `tika-parser-microsoft-module` instead of `tika-parsers-standard-package` | 228 to 193 classpath entries; DOCX support retained |
| API-docs path `/api-docs` | Keeps Springdoc out of the default `/v3/api-docs` namespace |

`-XX:TieredStopAtLevel=1` and lazy init are **local development** settings. They trade
peak throughput and fail-fast wiring for a faster cold start. Production should run with
`LAZY_INIT=false` and no tiering flag.

## Security

- JWT-based stateless authentication
- BCrypt password hashing
- CORS restricted to frontend origin
- File upload validation (type, size, MIME)
- User-scoped document access (users cannot access other users' documents)
- Document access is re-checked on every endpoint, not just on list
- Only `/api/auth/register` and `/api/auth/login` are public; every other endpoint
  requires a valid token and answers **401** otherwise
- Unauthenticated requests return a JSON error body, never a stack trace
- No API keys in frontend
- No sensitive data in logs
- Global exception handling (no stack traces exposed)

### Known findings

**Backend dependencies: clean.** 165 resolved runtime dependencies, zero OSV advisories
as of this upgrade.

**Frontend dependencies: 4 advisories, deliberately not patched.** These affect the
development toolchain and the router, not user data:

| Package | Installed | Severity | Note |
|---------|-----------|----------|------|
| `vite` | 5.4.21 | Moderate | Dev-server request handling |
| `esbuild` | 0.21.5 | Moderate | Reached through Vite |
| `react-router-dom` | 6.30.6 | High | Multi-tab/SSR hydration only; this app is a single-tab SPA |

Left as-is because moving to Vite 6+ requires a Rollup/Vite config migration and the
SPA does not use the affected SSR hydration path. Revisit alongside a frontend
framework upgrade rather than patching piecemeal.

**Hardcoded fallbacks.** `application.yml` ships a default database password and JWT
secret so the app runs with zero setup. These are development conveniences and must be
overridden via environment variables before any real deployment.

## Legal Disclaimer

> **LexiLens AI provides informational assistance for understanding legal documents. It does not provide legal advice and does not replace consultation with a qualified legal professional.**

## Future Enhancements

- PDF annotation and highlighting
- Clause comparison across documents
- Batch document processing
- Document templates library
- Webhook notifications
- Multi-user document sharing
- Custom risk rule configuration
- Admin analytics dashboard
- Mobile application
- Integration with document management systems
