# F2S Application - Security Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Authorization](#authorization)
4. [API Security](#api-security)
5. [AI/LLM Security](#aillm-security)
6. [Data Protection](#data-protection)
7. [Infrastructure](#infrastructure)
8. [Security Checklist for New Features](#security-checklist-for-new-features)

---

## Overview

This document describes the security measures implemented in the F2S (Feasibility to Success) project management application. All developers contributing to this project must understand and follow these guidelines.

### Tech Stack
- **Backend**: Node.js + Express
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: Next.js
- **AI**: Mistral AI API

---

## Authentication

### JWT-Based Authentication
The application uses JWT (JSON Web Tokens) for authentication.

**Location**: [`backend/middlewares/auth.js`](backend/middlewares/auth.js)

```javascript
module.exports.authenticateUser = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'No token' });
  
  const payload = verifyJWT(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const session = await findSession(payload.userId, token);
  if (!session) return res.status(401).json({ error: 'Session not found' });

  req.user = payload;
  next();
};
```

### Session Management
- Sessions are stored in the database and validated on each request
- Sessions can be extended automatically
- Tokens expire after 1 day (configurable via `JWT_EXPIRATION`)

### Password Security
- Passwords are hashed using bcrypt with 10 salt rounds
- Password reset functionality uses time-limited tokens

---

## Authorization

### Resource-Based Authorization
All project-scoped routes use the `authorizeResource` middleware to ensure users can only access resources they own or have permission to view.

**Location**: [`backend/middlewares/authorizeResource.js`](backend/middlewares/authorizeResource.js)

### Authorization Logic
The middleware checks if a user has access to a project by verifying:

1. **Client Membership**: User belongs to the project's client
2. **Project Manager**: User is the designated project manager
3. **Task Assignment**: User has task assignments in the project
4. **Admin Permissions**: User has `project:read:any` permission

```javascript
if (!hasAccess && !isManager && !hasTaskAssignment) {
  return res.status(403).json({ message: 'Vous n\'avez pas d\'autorisation sur ce projet' });
}
```

### Admin-Only Routes
Routes requiring admin privileges use the `isSuperAdmin` middleware:

```javascript
const { isSuperAdmin } = require('../middlewares/isAdmin');
router.post('/create', authenticateUser, isSuperAdmin, controller.create);
```

---

## API Security

### Protected Routes Pattern
All API routes must follow this pattern:

```javascript
// ✅ CORRECT - Authentication + Authorization
router.get('/:projectId', authenticateUser, authorizeResource('project'), controller.getData);

// ❌ WRONG - Missing authorization (IDOR vulnerability)
router.get('/:projectId', authenticateUser, controller.getData);
```

### Route Files and Their Protection

| Route File | Protection Level |
|------------|------------------|
| `ganttRoutes.js` | ✅ Fully protected with authorizeResource |
| `projectRoutes.js` | ✅ Fully protected |
| `mindmapRoutes.js` | ✅ Fully protected (fixed) |
| `responseRoutes.js` | ✅ Protected for project-scoped routes |
| `todoRoutes.js` | ✅ Protected for project routes |
| `ideationMistralRoutes.js` | ✅ Authentication only |

### Input Validation

**Location**: [`backend/middlewares/validateId.js`](backend/middlewares/validateId.js)

All ID parameters must be validated:

```javascript
router.get('/:projectId', validateId('projectId'), authorizeResource('project'), handler);
```

---

## AI/LLM Security

### Prompt Injection Prevention

The application uses Mistral AI for generating Gantt charts and mindmaps. Input validation blocks prompt injection attacks.

**Location**: 
- [`backend/controllers/mistralController.js`](backend/controllers/mistralController.js)
- [`backend/controllers/ideationMistralController.js`](backend/controllers/ideationMistralController.js)

### Blocked Patterns

The following patterns are blocked in AI inputs:

```javascript
const injectionPatterns = [
  // System prompt bypass attempts
  /^\\/system\\s/i,
  /^ignore\\s+previous/i,
  /^forget\\s+past/i,
  /^you\\s+are\\s+(now\\s+)?a\\s+(different|new)\\s+ai/i,
  
  // Jailbreak keywords
  /\\b(jailbreak|hack|bypass|override)\\b/i,
  
  // Off-topic content (multi-language)
  /\\b(tartiflette|recipe|cook|kitchen)\\b/i,  // Cooking
  /\\b(joke|jokes|funny|humor)\\b/i,             // Entertainment
  /\\b(movie|film|song|music)\\b/i,               // Media
  // ... more patterns in multiple languages
];
```

### Rate Limiting

AI endpoints have rate limiting to prevent abuse. The rate limit is configurable by administrators.

**Configuration Location**: [`backend/config/app-config.json`](backend/config/app-config.json)

**API Endpoints**:
- `GET /api/config/rate-limits` - Get current rate limit configuration
- `PUT /api/config/rate-limits` - Update rate limit configuration (requires super_admin)

**Default Configuration**:
```json
{
  "rateLimits": {
    "ai": {
      "requestsPerHour": 20,
      "enabled": true,
      "description": "Limite du nombre de requêtes IA par utilisateur et par heure"
    }
  }
}
```

**Frontend Admin UI**:
Admins can configure rate limits via the admin prompts page at `/admin/prompts`. The UI includes:
- Toggle to enable/disable rate limiting
- Slider to adjust requests per hour (1-100)

**Implementation**:
```javascript
// backend/services/mistralService.js
function getRateLimitConfig() {
  const config = require('../config/app-config.json');
  return config.rateLimits?.ai || { requestsPerHour: 20, enabled: true };
}
```

### Sanitization Function

A reusable sanitization function is provided in the service:

```javascript
// backend/services/mistralService.js
function sanitizeUserInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  // Remove injection patterns
  let sanitized = input
    .replace(/^\/system\s*/i, '')
    .replace(/\b(jailbreak|bypass)\b/gi, '');
  
  // Limit length
  return sanitized.substring(0, 2000).trim();
}
```

---

## Data Protection

### Environment Variables

**CRITICAL**: Never commit secrets to version control!

Required environment variables in `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/db"

# Authentication
JWT_SECRET="your-256-bit-random-secret-here"
JWT_EXPIRATION="1d"

# AI Services
MISTRAL_API_KEY="mistral-api-key"

# Security
BCRYPT_SALT_ROUNDS=10
```

### Secrets Management

For production, use:
- Docker secrets
- Kubernetes secrets
- HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault

### Database

- PostgreSQL with Prisma ORM
- Connection string should never be exposed in client-side code
- Use connection pooling in production

---

## Infrastructure

### Docker Security

The application runs in Docker containers. Key security practices:

1. **Don't run as root**: The frontend uses `USER nextjs`
2. **Minimal images**: Use Node.js Alpine images when possible
3. **Secrets**: Don't hardcode secrets in Dockerfiles

### Network Security

- Frontend (port 3000) → Backend (port 4000) → Database (port 5432)
- Only ports 3000 (frontend) and 4000 (backend) are exposed externally
- Database should not be exposed to the internet

### HTTPS

In production, ensure:
- TLS/SSL certificate is configured
- HTTP redirects to HTTPS
- Secure cookies (SameSite, HttpOnly flags)

---

## Security Checklist for New Features

When adding new features, always follow this checklist:

### 1. Authentication
- [ ] Does the route require authentication?
- [ ] Is `authenticateUser` middleware applied?

### 2. Authorization
- [ ] Does the route access project-specific data?
- [ ] Is `authorizeResource('project')` middleware applied?
- [ ] Does the controller verify the user owns/has access to the resource?

### 3. Input Validation
- [ ] Are all parameters validated?
- [ ] Are string inputs length-limited?
- [ ] Are special characters sanitized?

### 4. AI/LLM Features
- [ ] Is prompt injection blocked?
- [ ] Is rate limiting applied?
- [ ] Are off-topic inputs rejected?

### 5. Error Handling
- [ ] Do errors return appropriate HTTP status codes?
- [ ] Are error messages user-friendly but not revealing sensitive info?

### 6. Testing
- [ ] Test with invalid/empty inputs
- [ ] Test accessing other users' resources (IDOR)
- [ ] Test prompt injection attempts

---

## Common Vulnerabilities to Avoid

### IDOR (Insecure Direct Object Reference)
```javascript
// ❌ VULNERABLE - User can access any project
router.get('/:projectId', authenticateUser, getProject);

// ✅ SECURE - Authorization middleware checks access
router.get('/:projectId', authenticateUser, authorizeResource('project'), getProject);
```

### Missing Authorization
```javascript
// ❌ VULNERABLE - No check if user owns the resource
const response = await prisma.response.findUnique({ where: { id } });

// ✅ SECURE - Verify ownership
const response = await prisma.response.findUnique({ 
  where: { id },
  include: { project: true }
});
if (response.project.clientId !== user.clientId) {
  throw new ForbiddenError();
}
```

### Prompt Injection (AI Security)
```javascript
// ❌ VULNERABLE - User input goes directly to AI
const prompt = `Generate gantt for: ${userInput}`;

// ✅ SECURE - Validate and sanitize input
if (isPromptInjection(userInput)) {
  return res.status(400).json({ error: 'Invalid input' });
}
const prompt = `Generate gantt for: ${sanitizeUserInput(userInput)}`;
```

---

## Reporting Security Issues

If you discover a security vulnerability:

1. **Don't** create a public GitHub issue
2. **Do** contact the project maintainer directly
3. **Provide** detailed reproduction steps
4. **Allow** time for remediation before disclosure

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Prisma Security](https://www.prisma.io/docs/guides/security)
- [JWT Security](https://auth0.com/blog/json-web-token-security-best-practices/)

---

*Last Updated: March 2026*
*Version: 1.0*
