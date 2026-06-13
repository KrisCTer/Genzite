# QA & Automation Testing Rules

## Testing Philosophy

Test automation MUST follow a **verify-command-based, functional logic approach**. The focus is 100% on backend API correctness, database state verification, and JSON structure validity.

> **CRITICAL RULE**: STRICTLY EXCLUDE all UI testing.
> Do NOT write or suggest test assertions dependent on CSS classes, DOM elements, or visual layouts.
> The AI-generated UI changes frequently, making visual regression tests unreliable and wasteful.

## Backend Testing

### Tools
- **Jest**: Unit and integration test runner.
- **Supertest**: HTTP integration testing for NestJS controllers.
- **Prisma**: Use test-scoped database connections with schema reset between test suites.

### Test Coverage Requirements
Every API endpoint controller MUST have a corresponding test suite checking:

| Scenario | Expected HTTP Status |
|---|---|
| Valid request with correct payload | `200 OK` or `201 Created` |
| Invalid/malformed request body | `400 Bad Request` |
| Missing or invalid JWT token | `401 Unauthorized` |
| Insufficient role/permissions | `403 Forbidden` |
| Requested resource not found | `404 Not Found` |

### Test Structure
```
backend/
├── src/
│   └── <domain>/
│       └── __tests__/
│           ├── <domain>.service.spec.ts    # Unit tests for business logic
│           └── <domain>.controller.spec.ts # Integration tests for routes
└── test/
    └── <domain>.e2e-spec.ts               # End-to-end API tests
```

### Test Data Isolation
- Integration tests MUST spin up a temporary database or run with a schema reset to ensure full data isolation.
- Use test fixtures or factories for creating test data.
- NEVER depend on external services (Gemini API, S3) in unit tests – mock them.

### JSONB Data Verification
- Tests for the `data` module MUST verify that dynamic JSONB payloads are stored and retrieved correctly.
- Validate JSON schema structure matches the `CmsCollection.schemaDefinition` contract.

## Frontend Testing: EXCLUDED

> Per project rules, frontend tests are **not written or maintained**.
> The AI-generated UI surfaces change frequently, and all QA energy is focused on backend functional verification.

## QA Script Execution
- Test commands MUST be documented in `backend/package.json`:
  - `npm run test` → Unit tests
  - `npm run test:e2e` → End-to-end API tests
  - `npm run test:cov` → Coverage report
- All tests MUST pass cleanly without syntax warnings or environment failures before any merge.
