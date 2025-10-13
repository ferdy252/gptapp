#!/bin/bash
# Test all MCP tools

API_URL="${1:-http://localhost:3000}"

echo "🧪 Testing MCP Tools at $API_URL"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing health endpoint..."
curl -s "$API_URL/health" | jq .
echo ""

# Test 2: Manifest
echo "2️⃣  Testing MCP manifest..."
curl -s "$API_URL/mcp/manifest" | jq '.tools[] | .name'
echo ""

# Test 3: analyze_issue (mock)
echo "3️⃣  Testing analyze_issue..."
curl -s -X POST "$API_URL/mcp/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "analyze_issue",
    "input": {
      "photos": ["https://example.com/photo.jpg"],
      "description": "Kitchen faucet is dripping from the base"
    }
  }' | jq '.diagnosis.issue_type, .diagnosis.recommendation'
echo ""

# Test 4: generate_plan
echo "4️⃣  Testing generate_plan..."
curl -s -X POST "$API_URL/mcp/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "generate_plan",
    "input": {
      "issue_type": "Leaking kitchen faucet",
      "risk_level": "low"
    }
  }' | jq '.steps | length'
echo " steps generated"
echo ""

# Test 5: generate_bom
echo "5️⃣  Testing generate_bom..."
curl -s -X POST "$API_URL/mcp/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "generate_bom",
    "input": {
      "issue_type": "Leaking kitchen faucet"
    }
  }' | jq '.total_cost_min, .total_cost_max'
echo ""

# Test 6: request_quotes
echo "6️⃣  Testing request_quotes..."
curl -s -X POST "$API_URL/mcp/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "request_quotes",
    "input": {
      "zip": "90210",
      "scope": "Replace leaking kitchen faucet",
      "confirmed": true
    }
  }' | jq '.contractors | length'
echo " contractors found"
echo ""

echo "✅ All tests complete!"
