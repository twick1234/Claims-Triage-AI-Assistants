# Security

This page covers the security architecture of the Claims Triage AI prototype, SAST tooling, and the production security checklist.

---

## Security Architecture Overview

The application is a Next.js 14 app-router project. The security model is designed for the demo prototype; additional hardening is required before production use.

### What is Protected

| Control | Implementation |
|---|---|
| API keys | `ANTHROPIC_API_KEY` loaded from environment only — never hardcoded |
| No SQL injection surface | In-memory `Map` store — no database, no raw queries |
| Input validation | API route handlers parse and validate request bodies before processing |
| AI disclosure (GL8) | All agents identify as AI on first customer message |
| Security HTTP headers | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `X-XSS-Protection`, `Permissions-Policy` — configured in `next.config.mjs` |
| Hard-coded routing overrides | Emergency, legal, and human-request keywords trigger deterministic routing before any LLM call |

### What is Not Protected (Prototype Limitations)

- **No authentication** — operator pages (`/queue`, `/metrics`, `/triage`) are publicly accessible
- **No rate limiting** — `/api/chat` calls the Anthropic API without throttling
- **In-memory store** — data resets on restart; no persistence
- **No CSRF protection** — mutation routes accept unauthenticated POSTs

---

## SAST (Static Application Security Testing)

### Tools Configured

| Tool | Purpose |
|---|---|
| `eslint-plugin-security` | Detects common security anti-patterns (object injection, timing attacks, fs misuse) |
| `@typescript-eslint` | Flags `any` types and unsafe patterns |
| `next/typescript` | Next.js-specific TypeScript lint rules |

### Running a SAST Scan

```bash
# Lint check (warnings + errors)
npm run lint

# Output JSON report
npx eslint src/ --format json > security/eslint-report.json

# Output human-readable summary
npx eslint src/ 2>&1 | tee security/eslint-summary.txt
```

### Dependency Audit

```bash
# Run audit
npm audit

# Output JSON for automated parsing
npm audit --json > security/npm-audit-report.json
```

### Semgrep (Recommended for CI)

If `semgrep` is installed:

```bash
semgrep --config=p/typescript --config=p/nodejs --config=p/owasp-top-ten src/ --json > security/semgrep-report.json
```

Add to GitHub Actions:

```yaml
- uses: returntocorp/semgrep-action@v1
  with:
    config: >-
      p/typescript
      p/nodejs
      p/owasp-top-ten
```

---

## Test Coverage

Tests are written with Jest + React Testing Library. Coverage collected from `src/lib/**/*.ts` and `src/components/**/*.tsx`.

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Files

| File | What It Tests |
|---|---|
| `src/__tests__/triage/router.test.ts` | All hard-coded routing overrides (legal, human, turn limit, LLM fallthrough) |
| `src/__tests__/lib/store.test.ts` | Store initialization, seeded conversations, CRUD operations, metrics fields |
| `src/__tests__/lib/metrics.test.ts` | SLA breach detection, FCR calculation, agent utilization, tNPS averaging |
| `src/__tests__/components/PriorityBadge.test.tsx` | Badge rendering for all priority levels and sizes |
| `src/__tests__/components/AgentBadge.test.tsx` | Badge rendering for all agents, showLabel, size variants |

---

## Production Security Checklist

Before deploying to production, complete all items below:

### Must Have

- [ ] Add authentication to operator pages (`/queue`, `/metrics`, `/triage`) — use NextAuth.js or Clerk
- [ ] Add rate limiting on `/api/chat` — use Upstash Ratelimit or similar
- [ ] Add CSRF token validation on mutation API routes
- [ ] Configure `Content-Security-Policy` header in `next.config.mjs`
- [ ] Replace in-memory `Map` store with PostgreSQL or Redis
- [ ] Enable HSTS via hosting platform or reverse proxy

### Recommended

- [ ] Add structured request logging with trace IDs (for incident response)
- [ ] Set up Dependabot for automatic dependency update PRs
- [ ] Add `truffleHog` or `gitleaks` to CI pipeline for secret scanning
- [ ] Add response type guard on LLM output in `src/lib/agents/triage-agent.ts`
- [ ] Run DAST scan (see below) against staging before go-live

---

## DAST Recommendations

Dynamic Application Security Testing should be run against a **staging** environment before every production release.

### OWASP ZAP (Automated)

1. Download OWASP ZAP: https://www.zaproxy.org/
2. Run baseline scan:
   ```bash
   docker run -t owasp/zap2docker-stable zap-baseline.py -t https://your-staging-url.vercel.app
   ```
3. Run active scan (more thorough, may cause load):
   ```bash
   docker run -t owasp/zap2docker-stable zap-full-scan.py -t https://your-staging-url.vercel.app
   ```

### Burp Suite (Manual)

1. Configure browser proxy to Burp Suite (127.0.0.1:8080)
2. Browse to `/chat` and send messages — capture `/api/chat` requests
3. Replay with modified payloads:
   - Oversized `content` field (>50,000 chars)
   - Injected JSON in `content` (attempt to override system prompt)
   - Invalid `conversationId` values (IDOR test)
4. Test `/api/stream` SSE endpoint for cross-session data leakage
5. Test `/api/conversations/[id]` — attempt to read another user's conversation ID

### Priority Test Targets

| Endpoint | Attack Vectors |
|---|---|
| `POST /api/chat` | Input injection, oversized payload, rate limit bypass, prompt injection |
| `GET /api/stream` | SSE connection exhaustion, cross-session leakage |
| `GET /api/conversations/[id]` | IDOR |
| `POST /api/conversations/[id]/transfer` | Authorization bypass |

---

## Security Findings Reference

See `security/SECURITY-REPORT.md` for the full SAST report, architecture review, and remediation plan.

See the live [Security Dashboard](/security) page in the running app for a visual summary.
