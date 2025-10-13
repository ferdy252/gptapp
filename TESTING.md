# Testing Guide

Quick reference for testing all components of the Home Repair Diagnosis app.

## Unit Tests (Future)

Add Jest/Vitest for:
- Input validation
- Safety gate logic
- Price calculation
- Contractor ranking

## Manual Testing Checklist

### 1. Tool Testing

Test each MCP tool independently:

```bash
# analyze_issue
curl -X POST http://localhost:3000/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{"tool":"analyze_issue","input":{"photos":["url"],"description":"test"}}'

# generate_plan
curl -X POST http://localhost:3000/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{"tool":"generate_plan","input":{"issue_type":"leak","risk_level":"low"}}'

# generate_bom
curl -X POST http://localhost:3000/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{"tool":"generate_bom","input":{"issue_type":"leak"}}'

# request_quotes (requires confirmation)
curl -X POST http://localhost:3000/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{"tool":"request_quotes","input":{"zip":"90210","scope":"test","confirmed":true}}'
```

### 2. Safety Gate Testing

Test high-risk keyword detection:

**Should force "Hire":**
- "gas line leak"
- "electrical panel sparking"
- "roof structural damage"
- "foundation crack"

**Should allow DIY:**
- "leaking faucet"
- "squeaky door hinge"
- "loose cabinet handle"

### 3. UI Component Testing

Open http://localhost:5173 and verify:

- ✅ Issue Summary renders with correct badge (DIY/Hire)
- ✅ Confidence bar shows correct percentage
- ✅ Safety concerns display
- ✅ Actions limited to 2 max
- ✅ Parts & Tools table renders
- ✅ Toggle switches work
- ✅ Cost updates when items toggled
- ✅ Steps view opens in fullscreen
- ✅ Accordion expands/collapses
- ✅ Close button returns to summary

### 4. Security Testing

- ✅ Rate limiting (>100 requests in 15 min blocked)
- ✅ File size limit (>5MB rejected)
- ✅ File type validation (only JPEG/PNG/WebP)
- ✅ HTML injection prevented
- ✅ CORS restrictions enforced

### 5. ChatGPT Integration Testing

Connect via ngrok and test:

1. Photo upload
2. Diagnosis accuracy
3. Card rendering
4. Fullscreen transition
5. Quote confirmation flow

## Test Cases

### Happy Path
1. User uploads 3 photos of leaking faucet
2. Describes: "Water dripping from base"
3. Receives DIY diagnosis (low risk)
4. Views step-by-step plan
5. Exports parts list

### Safety Gate Path
1. User uploads photo of gas stove
2. Describes: "gas smell near stove"
3. Risk gate triggers
4. Forces "Hire Professional"
5. DIY disabled
6. Only "Get Quotes" shown

### Error Path
1. User uploads 6 photos (exceeds limit)
2. Request rejected with clear error
3. User retries with 3 photos
4. Success

## Performance Benchmarks

- Vision analysis: < 5 seconds
- Plan generation: < 3 seconds
- BOM generation: < 2 seconds
- Total workflow: < 15 seconds

## Monitoring

Check logs for:
- API errors
- Rate limit hits
- Validation failures
- Safety gate triggers

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production monitoring.
