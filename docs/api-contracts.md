# API Contracts

All endpoints are prefixed with `/api/v1`. Communication is strictly JSON over HTTP REST.
Authentication uses Bearer JWT tokens in the `Authorization` header where noted.

---

## 1. Identity Module (`/api/v1/auth`, `/api/v1/users`)

### POST `/api/v1/auth/register`
Registers a new user account.
- **Request**:
  ```json
  { "email": "user@example.com", "password": "strongpassword", "name": "Jane Doe" }
  ```
- **Response (201)**:
  ```json
  { "id": "uuid", "email": "user@example.com", "name": "Jane Doe" }
  ```

### POST `/api/v1/auth/login`
Authenticates and returns a JWT token.
- **Request**:
  ```json
  { "email": "user@example.com", "password": "strongpassword" }
  ```
- **Response (200)**:
  ```json
  { "accessToken": "jwt-token-string", "expiresIn": 86400 }
  ```

### GET `/api/v1/users/me` 🔒
Returns the authenticated user's profile.
- **Response (200)**:
  ```json
  { "id": "uuid", "email": "...", "name": "...", "roles": ["ADMIN"], "avatarUrl": null }
  ```

---

## 2. Site Module (`/api/v1/sites`)

### GET `/api/v1/sites` 🔒
Lists all sites owned by the authenticated user.
- **Response (200)**: `[ { "id": "...", "name": "...", "subdomain": "...", "createdAt": "..." } ]`

### POST `/api/v1/sites` 🔒
Creates a new site.
- **Request**: `{ "name": "My Shop", "subdomain": "myshop" }`
- **Response (201)**: `{ "id": "...", "name": "...", "subdomain": "..." }`

### POST `/api/v1/sites/:siteId/pages` 🔒
Adds a new page to a site.
- **Request**: `{ "title": "Home", "slug": "home" }`
- **Response (201)**: `{ "id": "...", "title": "...", "slug": "..." }`

### GET `/api/v1/sites/:siteId/pages` 🔒
Lists all pages for a site.

### PUT `/api/v1/sites/pages/:pageId/widgets` 🔒
Replaces the widget stack on a page.
- **Request**:
  ```json
  {
    "widgets": [
      { "type": "HERO", "contentConfig": { "title": "Welcome", "subtitle": "Build with AI" }, "sortOrder": 1 },
      { "type": "CARD", "contentConfig": { "heading": "Feature" }, "sortOrder": 2 }
    ]
  }
  ```

---

## 3. Data Module – Dynamic CMS (`/api/v1/cms`)

### POST `/api/v1/cms/collections` 🔒
Defines a new dynamic collection schema.
- **Request**:
  ```json
  {
    "siteId": "site-uuid",
    "name": "Products",
    "schemaDefinition": {
      "properties": {
        "name": { "type": "string", "required": true },
        "price": { "type": "number" },
        "imageUrl": { "type": "string" }
      }
    }
  }
  ```

### GET `/api/v1/cms/collections?siteId=<uuid>` 🔒
Lists all collections for a site.

### POST `/api/v1/cms/collections/:collectionId/records` 🔒
Creates a content record.
- **Request**: `{ "data": { "name": "Rose Bouquet", "price": 25.99, "imageUrl": "..." } }`

### GET `/api/v1/cms/collections/:collectionId/records` 🔒
Lists all records in a collection. Supports `?page=1&limit=20`.

### PUT `/api/v1/cms/records/:recordId` 🔒
Updates a record's data payload.

### DELETE `/api/v1/cms/records/:recordId` 🔒
Deletes a record.

---

## 4. Media Module (`/api/v1/media`)

### POST `/api/v1/media/presigned-url` 🔒
Returns an S3 Presigned URL for direct client upload.
- **Request**: `{ "filename": "resume.pdf", "mimeType": "application/pdf" }`
- **Response (200)**: `{ "uploadUrl": "https://s3.amazonaws.com/...", "s3Key": "uploads/uuid/resume.pdf" }`

### POST `/api/v1/media/confirm` 🔒
Registers file metadata after successful S3 upload.
- **Request**: `{ "s3Key": "uploads/uuid/resume.pdf", "filename": "resume.pdf", "mimeType": "application/pdf", "sizeBytes": 204800 }`
- **Response (201)**: `{ "id": "media-uuid", "s3Key": "..." }`

### GET `/api/v1/media` 🔒
Lists all media files for the authenticated user.

---

## 5. Notification Module (`/api/v1/notifications`)

### GET `/api/v1/notifications` 🔒
Lists recent notifications for the authenticated user.

### PUT `/api/v1/notifications/:id/read` 🔒
Marks a notification as read.

---

## 6. AI Module – Google Gemini (`/api/v1/ai`)

### POST `/api/v1/ai/agent/chat` 🔒
Reactive, single-turn agent that uses Gemini Function Calling to execute tools.
- **Request**: `{ "message": "Analyze this CV", "model": "gemini-2.0-flash" }`
- **Response (200)**:
  ```json
  {
    "message": "CV analyzed successfully.",
    "toolCalls": [
      { "tool": "analyze_cv", "params": { "resumeId": "..." } }
    ]
  }
  ```

### POST `/api/v1/ai/agent/plan` 🔒
Advanced multi-step planning agent. Generates a dependency-aware plan, executes it, and re-plans if a step fails.
- **Request**: `{ "message": "Build a portfolio site with a CMS for projects" }`
- **Response (200)**:
  ```json
  {
    "message": "Successfully generated site and CMS schemas.",
    "plan": {
      "goal": "Build a portfolio site...",
      "status": "completed",
      "steps": [
        { "id": "step_1", "description": "Generate site", "action": "generate_site", "status": "done" },
        { "id": "step_2", "description": "Generate CMS", "action": "generate_cms", "status": "done" }
      ]
    }
  }
  ```

### POST `/api/v1/ai/agent/ui` 🔒
Specialized UI Design Agent. Enforces design systems, UX psychology, and anti-cliché rules. Can dynamically use external codebase or stitch MCP tools.
- **Request**: `{ "message": "Design a premium pricing card" }`
- **Response (200)**:
  ```json
  {
    "message": "Pricing card generated.",
    "toolCalls": [ { "tool": "generate_ui_component", "params": { "componentName": "PricingCard" } } ],
    "generatedCode": [ "import React from 'react';\n..." ]
  }
  ```

### POST `/api/v1/ai/mcp`
Model Context Protocol (MCP) Server endpoint using Streamable HTTP. Exposes internal tools to external AI clients (like Claude Desktop).
- **Request**: MCP Protocol JSON-RPC envelope.
- **Response**: Streamed MCP JSON-RPC events.

### POST `/api/v1/ai/generate-site` 🔒
Generates site structure (pages + widgets) from a text prompt.
- **Request**: `{ "prompt": "Create a modern flower shop website with product gallery and checkout" }`
- **Response (200)**:
  ```json
  {
    "site": { "name": "Flower Paradise", "subdomain": "flowerparadise" },
    "pages": [
      {
        "title": "Home",
        "slug": "home",
        "widgets": [
          { "type": "HERO", "contentConfig": { "title": "Welcome to Flower Paradise" }, "sortOrder": 1 }
        ]
      }
    ]
  }
  ```

### POST `/api/v1/ai/generate-cms` 🔒
Generates dynamic CMS collection schemas from a text prompt.
- **Request**: `{ "siteId": "site-uuid", "prompt": "I need a product catalog with name, price, description, and image" }`
- **Response (200)**: `{ "collections": [ { "name": "Products", "schemaDefinition": { ... } } ] }`

### POST `/api/v1/ai/analyze-cv` 🔒
Analyzes a resume against a job description.
- **Request**: `{ "resumeId": "resume-uuid", "jobDescription": "Looking for a React developer..." }`
- **Response (200)**:
  ```json
  {
    "atsScore": 85,
    "missingSkills": ["TypeScript", "Next.js"],
    "keywordOptimization": ["Add 'REST API' to experience section"],
    "compatibilityReport": "Candidate has strong UI foundations..."
  }
  ```

### POST `/api/v1/ai/mock-interview/start` 🔒
Starts an interactive mock interview session.
- **Request**: `{ "resumeId": "resume-uuid", "jobDescription": "...", "sessionType": "TECHNICAL" }`
- **Response (200)**: `{ "sessionId": "session-uuid", "firstQuestion": "Can you describe your React hooks experience?" }`

### POST `/api/v1/ai/mock-interview/:sessionId/chat` 🔒
Sends candidate's response and receives feedback + next question.
- **Request**: `{ "message": "I regularly use useState and useEffect..." }`
- **Response (200)**:
  ```json
  {
    "feedback": "Good answer. Try to elaborate on cleanup functions.",
    "score": 7,
    "nextQuestion": "How do you handle side effects in useEffect?",
    "isComplete": false
  }
  ```

### POST `/api/v1/ai/mock-interview/:sessionId/end` 🔒
Ends a session and returns full evaluation.
- **Response (200)**:
  ```json
  {
    "overallScore": 72,
    "strengths": ["React fundamentals", "Problem solving"],
    "weaknesses": ["TypeScript generics", "Testing"],
    "studyRecommendations": [
      { "topic": "TypeScript generics", "priority": "HIGH", "resources": ["..."] }
    ]
  }
  ```

### GET `/api/v1/ai/career-coaching/:resumeId` 🔒
Returns a personalized career roadmap.
- **Response (200)**:
  ```json
  {
    "roadmap": [
      { "phase": "0-3 months", "topic": "TypeScript Advanced", "priority": "HIGH" },
      { "phase": "3-6 months", "topic": "System Design", "priority": "MEDIUM" }
    ]
  }
  ```

---

## Legend
- 🔒 = Requires `Authorization: Bearer <JWT>` header
