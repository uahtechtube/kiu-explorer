# KIU Explorer Feature Improvement Audit

## Scope reviewed
- Product requirements in `PRD.md` (feature promises and non-functional targets).
- API surface in `backend/routes/api.php`.
- Critical controller implementations in:
  - `backend/app/Http/Controllers/PaymentController.php`
  - `backend/app/Http/Controllers/AIController.php`
  - `backend/app/Http/Controllers/VirtualClassController.php`
- Existing automated tests in `backend/tests`.

## Top feature areas that need improvement

### 1) Payment feature is not production-ready yet (High priority)
**Why this matters**
- Payments are high-risk and user-trust critical.
- Current implementation can mark payments as paid without real gateway verification.

**Evidence found**
- `initiate()` is still a placeholder integration and returns a local URL pattern instead of a real provider authorization flow.
- `webhook()` currently has TODO notes and updates status directly from request payload.
- `downloadReceipt()` is still returning JSON rather than an actual receipt file/PDF.

**Recommended improvements**
- Integrate Paystack/Flutterwave end-to-end:
  - Create payment intent/transaction with gateway SDK/API.
  - Verify webhook signatures (HMAC) and idempotency keys.
  - Resolve payment status only from provider verification endpoint.
- Add immutable transaction audit trail (status transition history).
- Generate downloadable PDF receipts and store hash/checksum for auditability.
- Add retry-safe job queue for webhook processing.

---

### 2) Authorization is scattered and should be policy-driven (High priority)
**Why this matters**
- Role checks are repeated manually across many controllers, increasing inconsistency and security regression risk.

**Evidence found**
- Frequent inline checks like `$user->role !== 'admin'` or lecturer/student checks are spread throughout controllers.

**Recommended improvements**
- Centralize with Laravel Policies/Gates and route middleware (`can:*`).
- Introduce permission matrix by capability (not only role strings).
- Add authorization tests for sensitive endpoints (admin moderation, exams, content approval, hostel admin).

---

### 3) API route structure needs consolidation and cleanup (Medium-High priority)
**Why this matters**
- Duplicate routes and mixed aliases increase maintenance burden and create ambiguity for frontend consumers.

**Evidence found**
- Campus map routes are defined twice in `api.php`.
- Multiple alias patterns exist for overlapping resources (e.g., student-scoped and global paths) without explicit versioning conventions.

**Recommended improvements**
- Deduplicate and normalize endpoint namespaces:
  - `/v1/student/*`, `/v1/lecturer/*`, `/v1/admin/*`.
- Introduce OpenAPI/Swagger spec as source of truth.
- Add route tests to prevent accidental duplicate or conflicting registrations.

---

### 4) AI assistant feature needs stronger reliability and governance (Medium priority)
**Why this matters**
- PRD expects educational assistance with predictable behavior and response quality.
- Current fallback behavior can hide provider outages from system health metrics.

**Evidence found**
- AI controller uses Gemini directly with basic fallback text; no per-user rate limiting, moderation guardrail, or prompt/response safety pipeline.

**Recommended improvements**
- Add rate limiting and quota per user/course.
- Add moderation layer for harmful/off-topic requests.
- Add standardized prompt templates by use-case (homework help, summarization, exam prep).
- Track quality metrics (latency, token usage, refusal rate, satisfaction).

---

### 5) E-Classroom experience has baseline functionality but lacks depth (Medium priority)
**Why this matters**
- PRD expects rich live-class capabilities (attendance fidelity, reminders, potentially recording workflows).

**Evidence found**
- Virtual class flow supports schedule/start/join/end and chat basics.
- Notification call path exists for class creation, but there is no queue-based reminder strategy, reconnect handling, or participation analytics depth.

**Recommended improvements**
- Add scheduled reminder jobs (24h/1h/10m before class).
- Add join/leave event tracking and session duration analytics.
- Add attendance fraud controls (heartbeat/presence pings).
- Add recording metadata lifecycle and replay access policies.

---

### 6) Automated test coverage is too thin for the current feature breadth (High priority)
**Why this matters**
- Feature-rich backend with limited tests increases regression and release risk.

**Evidence found**
- Only a small set of baseline tests are present (`AuthTest` plus default example tests).

**Recommended improvements**
- Establish minimum test suite by module:
  - Auth/role access
  - Payment lifecycle
  - Exam attempts (timed/force submit)
  - Virtual class attendance/chat
  - Content moderation actions
- Add CI quality gates:
  - `phpunit` required pass
  - static analysis (Larastan/PHPStan)
  - coding standard checks

## Suggested execution plan

### Phase A (next 2 weeks)
1. Payment hardening (gateway verification + secure webhook + idempotency).
2. Authorization refactor to policies/gates for admin/lecturer/student-critical routes.
3. Route deduplication and API contract documentation.

### Phase B (weeks 3–5)
1. Expand automated tests to core flows.
2. Improve virtual classroom reminders and attendance analytics.
3. Add AI safety + rate limits + telemetry.

### Phase C (weeks 6+)
1. Non-functional work: caching, queue scaling, and observability dashboards.
2. Performance validation against PRD targets.

## Quick wins you can start immediately
- Remove duplicate campus route definitions.
- Convert repeated role `if` statements into policy checks in 2–3 critical controllers first.
- Add payment webhook signature validation before any status update.
- Add at least one feature test per high-risk module (payment, exams, moderation).
