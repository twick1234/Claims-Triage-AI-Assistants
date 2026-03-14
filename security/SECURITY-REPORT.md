# Security Report — Claims Triage AI

**Version:** 0.1.0
**Date:** 2026-03-14
**Scope:** Next.js 14 application at `/mnt/c/Users/markl/workspace/Claims-Triage-AI-Assistants`
**Assessor:** Automated SAST + manual architecture review

---

## Executive Summary

| Category | Result | Notes |
|---|---|---|
| Dependency Vulnerabilities | **PASS** | 0 critical, 0 high in production deps |
| Static Analysis (ESLint) | **WARN** | 0 errors, 3 warnings — no blocking issues |
| Security Architecture | **WARN** | 7 controls pass, 4 warnings (prototype-appropriate) |
| Test Coverage | **PASS** | Core routing, store, metrics, and components covered |
| Production Readiness | **WARN** | 4 items must be addressed before production |

---

## 1. Dependency Vulnerabilities (npm audit)

### Production Dependencies

| Package | Version | Vulnerabilities |
|---|---|---|
| @anthropic-ai/sdk | ^0.78.0 | None |
| next | ^14.2.35 | None (patched release) |
| react | ^18.3.1 | None |
| react-dom | ^18.3.1 | None |

**Result: 0 critical · 0 high · 0 moderate in production dependencies.**

### Dev Dependencies

Dev dependencies (eslint, testing libraries) have advisory-level notes but are **not shipped in the production bundle**. They are excluded from the production risk surface.

### Recommendation

- Pin production dependencies in `package.json` (already using semver ranges with lock file)
- Run `npm audit` in CI on every PR
- Subscribe to Dependabot alerts on GitHub

---

## 2. Static Analysis Findings (ESLint + eslint-plugin-security)

### Configuration

ESLint configured with:
- `eslint-plugin-security` (detect-object-injection, detect-non-literal-fs-filename, detect-possible-timing-attacks)
- `@typescript-eslint` (no-explicit-any)
- `next/core-web-vitals` + `next/typescript`

### Findings

**Errors: 0**

**Warnings: 3**

| Rule | File | Line | Assessment |
|---|---|---|---|
| `security/detect-object-injection` | `src/lib/store.ts` | 30 | Low risk — property access on a typed Map, keys are typed `AgentId` |
| `@typescript-eslint/no-explicit-any` | `src/lib/agents/triage-agent.ts` | 14 | Medium — LLM response parsed as `any`; add response shape type guard |
| `security/detect-possible-timing-attacks` | `src/app/api/conversations/[id]/route.ts` | 22 | Low — string comparison on a non-secret conversation ID |

### Semgrep

Semgrep was not available in this environment. For CI, add to GitHub Actions:
```yaml
- uses: returntocorp/semgrep-action@v1
  with:
    config: >-
      p/typescript
      p/nodejs
      p/owasp-top-ten
```

---

## 3. Security Architecture Review

### Passed Controls ✅

- **No secrets in codebase** — `ANTHROPIC_API_KEY` is loaded exclusively from environment variables (`process.env`). Verified: no hardcoded API keys or tokens found in any source file.
- **No SQL injection surface** — The application uses an in-memory `Map` store. There is no database, no ORM, and no raw query construction.
- **Input validation on API routes** — All API route handlers parse and validate the request body with explicit type checks before processing.
- **GL8 AI disclosure compliance** — Every agent (Grace, Swift, Kara, Phoenix) identifies itself as an AI on the first message to the customer.
- **Security HTTP headers** — Added via `next.config.mjs`:
  - `X-Frame-Options: DENY` (clickjacking protection)
  - `X-Content-Type-Options: nosniff` (MIME sniffing protection)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-XSS-Protection: 1; mode=block`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **No direct filesystem access** — No `fs` module usage in application code.
- **Dependency pinning** — `package-lock.json` locks all transitive dependencies.

### Warnings ⚠️ (Prototype-Appropriate, Fix Before Production)

- **In-memory store** — All conversation data lives in a Node.js `Map`. Data resets on server restart. This is intentional for the demo prototype. Replace with PostgreSQL/Redis before production.
- **No authentication on operator endpoints** — `/queue`, `/metrics`, and `/triage` pages are publicly accessible. Add authentication middleware (NextAuth.js, Clerk, or similar) before production.
- **No rate limiting** — `/api/chat` calls the Anthropic API without rate limiting. A bad actor could generate high API costs. Add Upstash Ratelimit or similar before production.
- **No CSRF protection** — API mutation routes accept JSON POSTs without CSRF token validation. Standard browser SameSite cookies provide some protection, but explicit CSRF tokens are recommended for production.

---

## 4. DAST Notes

Dynamic Application Security Testing should be performed against a staging deployment before go-live.

### Recommended Tools

| Tool | Usage |
|---|---|
| OWASP ZAP | Baseline + active scan against all routes |
| Burp Suite Community | Manual intercept and replay of `/api/chat`, `/api/stream`, `/api/conversations/[id]` |
| nuclei | Template-based HTTP vulnerability scanning |

### Priority DAST Targets

- `POST /api/chat` — input injection, oversized payloads, rate limit bypass
- `GET /api/stream` (SSE) — connection exhaustion, data leakage across conversations
- `GET/PATCH /api/conversations/[id]` — IDOR (insecure direct object reference)
- `POST /api/conversations/[id]/transfer` — authorization bypass

---

## 5. Remediation Plan (Before Production)

**Priority 1 — Security-Critical (Must Fix)**

1. Add authentication to `/queue`, `/metrics`, `/triage` operator pages
2. Add rate limiting on `/api/chat` (Anthropic API spend protection)
3. Add CSRF tokens on all mutation API routes
4. Configure `Content-Security-Policy` header (currently missing)

**Priority 2 — Architecture (Must Fix for Persistence)**

5. Replace in-memory `Map` store with PostgreSQL or Redis
6. Add structured logging with request tracing (for incident response)

**Priority 3 — Hardening (Recommended)**

7. Enable HSTS via hosting platform (Vercel or reverse proxy)
8. Add `Strict-Transport-Security` header
9. Add response type guard on LLM output in `triage-agent.ts`
10. Consider a secrets scanning step in CI (e.g. `truffleHog`, `gitleaks`)

---

## 6. PenTest Scope Document

### Scope

**In scope:**
- Next.js application (all routes under `/`)
- API routes: `/api/chat`, `/api/stream`, `/api/conversations/*`, `/api/metrics`, `/api/queue/*`
- Authentication bypass (when auth is added)
- Authorization and IDOR on conversation endpoints
- SSE stream isolation between sessions
- Input injection (prompt injection via customer message field)
- Rate limiting bypass
- HTTP security header validation
- Cookie security (SameSite, HttpOnly, Secure flags)

**Out of scope:**
- Anthropic API infrastructure (Claude backend)
- Vercel platform infrastructure
- Physical/network-level attacks

### Pentest Objectives

1. Confirm no IDOR vulnerabilities on `/api/conversations/[id]` (can User A read User B's conversation?)
2. Confirm rate limiting prevents cost-amplification attacks on `/api/chat`
3. Confirm SSE stream (`/api/stream`) does not leak cross-session events
4. Confirm authentication cannot be bypassed on operator endpoints
5. Test for prompt injection: can a crafted customer message override agent system prompts?
6. Confirm all security headers are present and correctly configured

### Rules of Engagement

- Testing against staging environment only — never production
- No denial-of-service testing without explicit approval
- Document all findings with steps to reproduce, impact rating (CVSS), and remediation
- Deliver report within 5 business days of testing

---

*This report covers the prototype build (v0.1.0). Re-assess before each production release.*
