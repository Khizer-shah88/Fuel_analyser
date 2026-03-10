# 401 Unauthorized Error - Complete Solution Guide

## Quick Navigation

### 🚨 I'm Getting 401 Error Right Now
→ Read: **[401_QUICK_FIX.md](401_QUICK_FIX.md)** (2-minute read)

### 🔧 I Want to Fix My ESP8266 Code
→ Read: **[ESP01_CONFIGURATION_FOR_401_FIX.md](../ESP01_CONFIGURATION_FOR_401_FIX.md)** (5-minute read)

### 🔍 I Need to Debug This Thoroughly
→ Read: **[API_AUTHENTICATION_DEBUG_GUIDE.md](API_AUTHENTICATION_DEBUG_GUIDE.md)** (20-minute read)

### 📊 I Want Full Technical Details
→ Read: **[401_FIX_COMPLETE_ANALYSIS.md](401_FIX_COMPLETE_ANALYSIS.md)** (30-minute read)

### ✅ I Want to Verify Everything Works
→ Run: **[test-pump-api.sh](test-pump-api.sh)** (2-minute execution)

### 📋 What Was Actually Done?
→ Read: **[401_IMPLEMENTATION_SUMMARY.md](401_IMPLEMENTATION_SUMMARY.md)** (10-minute read)

---

## The Problem

Your ESP8266 module is receiving:
```json
{
  "statusCode": 401,
  "error": "Invalid authorization header",
  "message": "Invalid API key. Pump not found or API key is incorrect."
}
```

---

## The Solution (TL;DR)

1. **Verify header exists** in ESP8266 code (around line 350):
   ```cpp
   http.addHeader("x-api-key", apiKey);
   ```

2. **Re-upload** sketch to ESP8266

3. **In Serial Monitor** (115200 baud), type:
   ```
   REGISTER
   ```

4. **Wait for success**:
   ```
   ✅ Registration successful!
   API Key: 9f3d5e2a1b4c...
   ```

5. **Test**:
   ```
   TEST
   ```

6. **Should see**:
   ```
   ✅ Data sent successfully!
   ```

---

## Files Overview

### Documentation Files

| File | Purpose | Read Time | When to Use |
|------|---------|-----------|------------|
| **401_QUICK_FIX.md** | Quick reference card | 2 min | Now - start here! |
| **API_AUTHENTICATION_DEBUG_GUIDE.md** | Comprehensive troubleshooting | 20 min | If 401 persists |
| **401_FIX_COMPLETE_ANALYSIS.md** | Full technical analysis | 30 min | For deep understanding |
| **401_IMPLEMENTATION_SUMMARY.md** | What was fixed | 10 min | Understanding changes |
| **ESP01_CONFIGURATION_FOR_401_FIX.md** | ESP8266 code fixes | 5 min | For code changes |

### Testing Files

| File | Purpose | Usage |
|------|---------|-------|
| **test-pump-api.sh** | Automated API testing | `bash test-pump-api.sh` |

### Backend Code Files (Modified)

| File | Changes | Impact |
|------|---------|--------|
| `src/auth/api-key.guard.ts` | Added debug logging | Shows validation details |
| `src/auth/auth.service.ts` | Added diagnostic logging | Shows database lookups |

---

## Step-by-Step Solution

### Phase 1: Immediate Action (5 minutes)

**Step 1:** Check the header in your ESP8266 code
```bash
# Open in editor:
ESP01_Pump_Module_Production.ino
# Search for: sendTransactionData
# Find line: http.addHeader("x-api-key", apiKey);
# If missing → ADD IT
```

**Step 2:** Re-upload to ESP8266
```
Arduino IDE → Sketch → Upload
Wait for: "Sketch uses X bytes..."
```

**Step 3:** Test registration
```
Serial Monitor (115200 baud)
Type: REGISTER
Expect: ✅ Registration successful!
```

**Step 4:** Test transaction
```
Serial Monitor
Type: TEST
Expect: ✅ Data sent successfully!
```

---

### Phase 2: If Still Getting 401 (15 minutes)

**Step 5:** Enable backend debug logging
```bash
cd /home/khizer/fuel_analyser/backend
npm run start:dev
```

**Step 6:** Watch backend logs while testing
```
Look for: 🔍 [API Key Guard] Incoming headers:
          📋 [API Key Guard] Extracted API Key: Present
          ✅ [API Key Guard] Authentication successful
```

**Step 7:** Compare logs against [API_AUTHENTICATION_DEBUG_GUIDE.md](API_AUTHENTICATION_DEBUG_GUIDE.md)
```
If you see: ❌ API key is missing → ESP8266 not sending header
If you see: ❌ No pump found → API key doesn't exist in database
If you see: ✅ Success → Something else is wrong, check error response
```

**Step 8:** Run automated test script
```bash
cd /home/khizer/fuel_analyser/backend
chmod +x test-pump-api.sh
./test-pump-api.sh 10.126.234.42 3000 PUMP-001
```

---

### Phase 3: Deep Debugging (30 minutes)

If you still have issues after Phase 2:

1. **Read full analysis**: [401_FIX_COMPLETE_ANALYSIS.md](401_FIX_COMPLETE_ANALYSIS.md)
2. **Check all 5 root causes** (missing header, no registration, stale key, WiFi, ID mismatch)
3. **Enable detailed logging** on both ESP8266 and backend
4. **Compare your request** to exact format in guide
5. **Verify pump registration** before sending data

---

## Expected Behavior Timeline

### ✅ Correct Flow
```
1. ESP8266 Startup
   ├─ Connects to WiFi
   ├─ Syncs time with NTP
   ├─ Registers pump (gets API key)
   └─ Logs: ✅ Registration successful!

2. Pump Detects Fuel Transaction
   ├─ Reads flow sensor
   ├─ Builds JSON payload
   ├─ Adds x-api-key header
   └─ Sends POST request

3. Backend Receives Request
   ├─ ApiKeyGuard validates header
   ├─ AuthService looks up pump
   ├─ PumpsService stores data
   └─ Returns: 200 OK with transaction ID

4. ESP8266 Confirms
   ├─ Receives 200 response
   ├─ Logs: ✅ Data sent successfully!
   └─ Resets for next transaction
```

### ❌ Error Flow (Getting 401)
```
1. ESP8266 Sends Request
   ├─ Missing header OR
   ├─ Empty API key OR
   └─ Invalid API key

2. Backend Receives
   ├─ ApiKeyGuard checks header
   ├─ Header is missing/invalid
   └─ Returns: 401 Unauthorized

3. ESP8266 Sees Error
   └─ Logs: ❌ Request failed (HTTP 401)
```

---

## Diagnostic Commands Quick Reference

### ESP8266 Serial Monitor Commands (115200 baud)

```
REGISTER    → Register pump and get API key
              Output: ✅ Registration successful!
                     API Key: 9f3d5e2a...

STATUS      → Show system status
              Output: WiFi: ✓ Connected
                     Pump Registered: ✓ Yes
                     API Key: ✓ Present

TEST        → Send test transaction to backend
              Output: ✅ Data sent successfully!
                     OR ❌ Request failed (HTTP 401)

HELP        → Show available commands
```

### Backend Debug Commands

```bash
# Start with debug logging
npm run start:dev

# Watch for these in logs:
# 🔍 [API Key Guard] Incoming headers:
# 📋 [API Key Guard] Extracted API Key:
# ✅ [API Key Guard] Authentication successful
# ❌ [API Key Guard] Pump not found
```

### cURL Test Commands

```bash
# Register pump
curl -X POST http://10.126.234.42:3000/api/pumps/register \
  -H "Content-Type: application/json" \
  -d '{"pumpId": "PUMP-001"}'

# Send transaction with correct header
curl -X POST http://10.126.234.42:3000/api/pumps/data \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"pumpId": "PUMP-001", "liters": 12.5}'

# Test without header (will get 401)
curl -X POST http://10.126.234.42:3000/api/pumps/data \
  -H "Content-Type: application/json" \
  -d '{"pumpId": "PUMP-001", "liters": 12.5}'
```

---

## Root Causes (Check These)

| # | Cause | Check | Fix |
|---|-------|-------|-----|
| 1 | Missing x-api-key header | Search ESP code for `addHeader("x-api-key"` | Add the line if missing |
| 2 | Empty API key after registration | Serial: `STATUS` shows "API Key: ✗ Missing" | Type `REGISTER` to get key |
| 3 | Stale/invalid API key | Backend logs show no pump found | Re-register: `REGISTER` |
| 4 | WiFi not connected | Serial: `STATUS` shows "WiFi: ✗ Disconnected" | Check WiFi credentials |
| 5 | Pump ID mismatch | Backend error: "Pump ID mismatch" | Match ESP `PUMP_ID` to registered ID |

---

## Success Indicators

### ✅ In ESP8266 Serial Monitor
```
✅ WiFi connected!
   IP: 192.168.1.100
   Signal: -45 dBm

✅ Registration successful!
   API Key: 9f3d5e2a1b4c7e8f9g0h1i2j3k4l5m6n...
   Registered: Already registered

🧪 Simulating test transaction...
   Liters: 12.5
📤 Sending transaction to backend...
   URL: http://10.126.234.42:3000/api/pumps/data
✅ Data sent successfully!
```

### ✅ In Backend Logs
```
[12:45:32] LOG [ApiKeyGuard] 🔍 Incoming headers logged...
[12:45:32] LOG [ApiKeyGuard] 📋 Extracted API Key: Present
[12:45:32] LOG [ApiKeyGuard] ✅ Authentication successful for pump: PUMP-001
[12:45:32] LOG [PumpsController] 📥 Received pump data from PUMP-001
[12:45:32] LOG [PumpsService] 💾 Saving transaction to database: PUMP-001
[12:45:32] LOG [PumpsController] ✅ Successfully saved transaction for PUMP-001: 12.5L
```

### ✅ In Test Script Output
```
✅ Pump registered!
   API Key: 9f3d5e2a1b4c7e8f...
✅ Transaction data sent successfully!
✅ Correctly rejected invalid API key
✅ Correctly rejected request without API key
✅ All tests completed!
```

---

## FAQ

### Q: Why am I getting 401 now when it worked before?
**A:** Most likely: API key expired or registration incomplete. Type `REGISTER` in Serial Monitor to get a fresh key.

### Q: Do I need to re-register every time?
**A:** No, only once during startup. After that, the API key is stored in the `apiKey` variable until ESP8266 restarts.

### Q: What if the x-api-key header line is already in my code?
**A:** Then the issue is likely: (1) WiFi disconnected, (2) Empty API key, (3) Pump ID mismatch. Run backend with debug logging to see exact error.

### Q: Can I use a different header format?
**A:** No, the backend specifically expects `x-api-key`. Using `Authorization: Bearer` will fail.

### Q: Does the API key change every time I register?
**A:** Yes, a new API key is generated with each registration. Use the latest one.

### Q: What if I forget to register?
**A:** The `apiKey` variable will be empty, requests will fail with 401. Type `REGISTER` in Serial Monitor.

---

## Quick Troubleshooting Flowchart

```
         ┌─ Getting 401? ─────────┐
         │                         │
         ▼                         │
   Read 401_QUICK_FIX.md ◄──────┐  │
   (2 minute read)             │  │
         │                      │  │
         ▼                      │  │
   Still getting 401?  NO──────┤  │
         │                      │  │
        YES                     │  │
         │                      │  │
         ▼                      │  │
   Is x-api-key header present? │  │
         │                      │  │
         ├─ NO → Add line      │  │
         │        (ESP01_CONFIGURATION_FOR_401_FIX.md)
         │        ✅ Fixed     │  │
         │                      │  │
         └─ YES → Continue     │  │
         │                      │  │
         ▼                      │  │
   Is WiFi connected?  │  │
         │                      │  │
         ├─ NO → Check WiFi    │  │
         │       Credentials   │  │
         │       ✅ Fixed      │  │
         │                      │  │
         └─ YES → Continue     │  │
         │                      │  │
         ▼                      │  │
   Is API key present?  │  │
         │                      │  │
         ├─ NO → Type REGISTER │  │
         │       In Serial     │  │
         │       ✅ Fixed      │  │
         │                      │  │
         └─ YES → Continue     │  │
         │                      │  │
         ▼                      │  │
   Enable backend logs  │  │
   npm run start:dev   │  │
   (API_AUTH_DEBUG_GUIDE.md)
         │                      │  │
         ▼                      │  │
   Check backend logs for cause │  │
   (Follow detailed guide)      │  │
         │                      │  │
         └──────────────────────┘  │
                                   │
         ✅ Fixed! You're all set! │
         │                         │
         └─────────────────────────┘
```

---

## Next Steps

### Immediate (Right Now)
- [ ] Open [401_QUICK_FIX.md](401_QUICK_FIX.md)
- [ ] Check if x-api-key header is in ESP code
- [ ] Run `REGISTER` command in Serial Monitor
- [ ] Run `TEST` command in Serial Monitor

### Short Term (Today)
- [ ] Re-upload sketch if changes made
- [ ] Run automated test script
- [ ] Verify backend logs show ✅ success

### Verification
- [ ] ESP8266 shows ✅ Registration successful!
- [ ] ESP8266 shows ✅ Data sent successfully!
- [ ] Backend logs show ✅ Authentication successful
- [ ] No more 401 errors in responses

---

## Support Resources

- **Quick Reference:** [401_QUICK_FIX.md](401_QUICK_FIX.md)
- **Comprehensive Guide:** [API_AUTHENTICATION_DEBUG_GUIDE.md](API_AUTHENTICATION_DEBUG_GUIDE.md)
- **Technical Details:** [401_FIX_COMPLETE_ANALYSIS.md](401_FIX_COMPLETE_ANALYSIS.md)
- **ESP8266 Fix:** [ESP01_CONFIGURATION_FOR_401_FIX.md](../ESP01_CONFIGURATION_FOR_401_FIX.md)
- **Testing Tool:** [test-pump-api.sh](test-pump-api.sh)

---

## Status

✅ **Backend authentication system analyzed**
✅ **Debug logging added**
✅ **Documentation complete**
✅ **Testing tools provided**
✅ **Ready for immediate testing**

---

**Last Updated:** February 17, 2026
**Version:** 1.0 - Production Ready
**Expected Resolution Time:** 5-30 minutes depending on root cause
