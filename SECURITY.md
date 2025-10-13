# Security & Privacy Policy

This document outlines the security measures and data handling practices for the Home Repair Diagnosis ChatGPT app.

## Data Collection & Retention

### What We Collect

1. **Photos** (1-5 per request)
   - Purpose: Visual diagnosis of repair issues
   - Storage: In-memory only during analysis
   - Retention: **Deleted immediately** after analysis completes
   - Never stored to disk or database

2. **Issue Descriptions**
   - Purpose: Supplement photo analysis
   - Storage: Temporary (request lifecycle only)
   - Retention: 30 days for diagnostics improvement
   - Sanitized: HTML/script tags removed

3. **Diagnosis Results**
   - Purpose: App functionality
   - Storage: Session-based
   - Retention: 30 days
   - Includes: issue type, risk level, confidence score

4. **Quote Requests**
   - Purpose: Contractor matching
   - Storage: Database
   - Retention: 90 days
   - Includes: ZIP code, work scope
   - **Does NOT include**: Full address, phone, email (handled by contractor platforms)

### What We DON'T Collect

❌ Full name or address  
❌ Payment information  
❌ Social security or tax ID  
❌ Account credentials  
❌ Location data (only ZIP code for contractor matching)  
❌ Device identifiers or tracking cookies

## Security Measures

### Server-Side Protection

1. **Input Validation**
   - All inputs validated with Zod schemas
   - File type restrictions (JPEG, PNG, WebP only)
   - File size limits (5MB per photo, 5 photos max)
   - Description length limits (10-500 characters)
   - ZIP code format validation

2. **Injection Prevention**
   - HTML/script tag sanitization
   - SQL parameterization (if database added)
   - No `eval()` or dynamic code execution
   - Content Security Policy headers

3. **Rate Limiting**
   - 100 requests per 15 minutes per IP
   - Prevents API abuse and DoS attacks
   - Configurable via environment variables

4. **CORS Protection**
   - Restricted to `https://chatgpt.com`
   - Credentials required for cross-origin requests
   - No wildcard (`*`) origins in production

5. **HTTPS Required**
   - All communications encrypted in transit
   - TLS 1.2+ enforced
   - HSTS headers enabled

6. **API Key Security**
   - OpenAI API key in environment variables only
   - Never exposed in client code or logs
   - Rotated quarterly (recommended)

### Data Protection

1. **PII Redaction**
   - Automatic redaction in logs
   - Sensitive fields (photos, addresses) replaced with `[REDACTED]`
   - No PII in error messages

2. **Access Control**
   - Least-privilege API scopes
   - Vision API read-only access
   - No persistent data access without user consent

3. **Encryption**
   - Data encrypted in transit (HTTPS)
   - API keys encrypted at rest (platform-managed)
   - No persistent storage of photos (in-memory only)

## User Consent & Control

### Quote Request Confirmation

Contractor outreach requires **explicit user confirmation**:

```javascript
{
  "confirmed": true  // MUST be true, or request fails
}
```

The app will:
1. Show preview of what will be shared
2. List which contractors will receive info
3. Require user to click "Confirm" before proceeding

### Data Deletion

Users can request data deletion:
- **Email**: privacy@yourapp.com
- **Response time**: Within 48 hours
- **Scope**: All stored diagnoses and quote requests

## Safety Gates

### High-Risk Issue Detection

Automatic detection of dangerous repairs:

**Force "Hire Professional" for:**
- ⚡ Electrical panel work
- 🔥 Gas line repairs
- 🏠 Structural/foundation issues
- 🏚️ Roof height work
- ☣️ Asbestos/mold
- 🚰 Main water/sewer lines

When detected:
- DIY option **disabled**
- Safety warning displayed
- Only "Get Quotes" action shown

### User Confirmation Required

The following actions need user approval:
- Contacting contractors
- Sharing ZIP code/scope
- Exporting personal data

## Third-Party Services

### OpenAI API

- **Purpose**: Vision analysis, plan/BOM generation
- **Data shared**: Photos, descriptions
- **Retention**: Per OpenAI's 30-day policy
- **Privacy policy**: https://openai.com/policies/privacy-policy

### Contractor Platforms (Future Integration)

Potential integrations:
- HomeAdvisor
- Thumbtack
- Angi (formerly Angie's List)

**Data shared**: ZIP code, work scope only  
**NOT shared**: Full address, phone, email (user provides directly to contractors)

## Compliance

### GDPR (EU Users)

- ✅ Right to access data
- ✅ Right to deletion
- ✅ Right to data portability
- ✅ Consent-based processing
- ✅ Minimal data collection

### CCPA (California Users)

- ✅ Disclosure of data collection
- ✅ Right to opt-out of data sales (we don't sell data)
- ✅ Right to deletion
- ✅ Non-discrimination for privacy requests

### SOC 2 Type II (Planned)

For enterprise deployments, implement:
- Annual security audits
- Penetration testing
- Incident response plan
- Employee security training

## Vulnerability Disclosure

Found a security issue? Please report responsibly:

**Email**: security@yourapp.com  
**PGP Key**: [Your PGP key if applicable]

We commit to:
1. Acknowledge within 24 hours
2. Provide status updates every 72 hours
3. Fix critical issues within 7 days
4. Credit researchers (if desired)

**Bug Bounty** (if applicable): $50-$500 depending on severity

## Incident Response

In case of a security breach:

1. **Detection**: Automated monitoring + manual review
2. **Containment**: Isolate affected systems within 1 hour
3. **Notification**: Affected users notified within 24 hours
4. **Remediation**: Patch deployed within 48 hours
5. **Post-mortem**: Public report within 7 days

## Audit Log

All security events logged:
- Failed authentication attempts
- Rate limit violations
- Blocked CORS requests
- Input validation failures
- API errors
- Tool execution failures

Logs retained 7 days, PII-redacted.

## Updates to This Policy

Last updated: **January 2025**

We may update this policy as we:
- Add new features
- Integrate third-party services
- Improve security measures

Users will be notified of **material changes** via:
- In-app notification
- Email (if email is collected)
- 30-day advance notice for major changes

## Contact

**Privacy inquiries**: privacy@yourapp.com  
**Security issues**: security@yourapp.com  
**General support**: support@yourapp.com

---

*By using this app, you agree to this Security & Privacy Policy.*
