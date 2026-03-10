# 401 Unauthorized - Quick Fix Reference

## ⚡ The Problem
ESP8266 sends: `401 Unauthorized: Invalid authorization header`

## ✅ The Solution

Your ESP8266 is sending the correct header format (`x-api-key`), but one of these is mismatched:

### 1️⃣ Missing API Key Registration
```
Serial Monitor shows:
❌ Registration failed
```
**Fix:** Ensure pump registration completes first:
```cpp
// In Serial Monitor, type: REGISTER
// Wait for: ✅ Registration successful!
// API Key: 9f3d5e2a1b4c7e...
```

### 2️⃣ API Key Not Saved
```
Backend logs show:
❌ No pump found with API key: abc123...
```
**Fix:** After registration, confirm the firmware stored the key:
```cpp
// In Serial Monitor, type: STATUS
// Should show: API Key: ✓ Present
```

### 3️⃣ Pump ID Mismatch
```
Backend logs show:
❌ Pump ID mismatch
```
**Fix:** Verify your ESP8266 `PUMP_ID` matches registration:
```cpp
// Line ~52 in ESP01_Pump_Module_Production.ino
const String PUMP_ID = "PUMP-001";  // Must match registered pump

// In Serial Monitor, type: STATUS
// Should show: Pump ID that matches
```

### 4️⃣ WiFi Connection Broken
```
Serial Monitor shows:
⚠ WiFi disconnected
```
**Fix:** Reconnect WiFi:
```cpp
// Check: WIFI_SSID and WIFI_PASSWORD in config
// In Serial Monitor, type: STATUS
// Must show: WiFi: ✓ Connected
```

---

## 🔍 Diagnostic Commands (Send via Serial @ 115200 baud)

| Command | Output | Means |
|---------|--------|-------|
| `REGISTER` | ✅ Registration successful | Pump is registered |
| | ❌ Registration failed | Check WiFi + API endpoint |
| `STATUS` | WiFi: ✓ Connected | Pump can reach backend |
| | Pump Registered: ✓ Yes | API key is stored |
| | API Key: ✓ Present | Key is in memory |
| `TEST` | ✅ Data sent successfully! | Everything is working |
| | ⚠ Skipped - not ready | API key or WiFi missing |
| `HELP` | Lists all commands | Use for reference |

---

## 📋 Backend Endpoint Reference

### Pump Registration (DO THIS FIRST)
```bash
curl -X POST http://10.126.234.42:3000/api/pumps/register \
  -H "Content-Type: application/json" \
  -d '{"pumpId": "PUMP-001"}'
```
**Returns:** `apiKey` field (used in all future requests)

### Send Transaction Data (REQUIRES x-api-key)
```bash
curl -X POST http://10.126.234.42:3000/api/pumps/data \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -d '{
    "pumpId": "PUMP-001",
    "liters": 12.5,
    "timestamp": "2026-02-17T14:30:45Z"
  }'
```

---

## 🔧 Configuration Checklist

- [ ] Updated `PUMP_ID` in ESP8266 config (line ~52)
- [ ] Updated `WIFI_SSID` and `WIFI_PASSWORD` (lines ~43-44)
- [ ] Updated `SERVER_IP` to your backend (line ~48)
- [ ] Registered pump (Serial: `REGISTER`)
- [ ] Confirmed registration successful (API Key received)
- [ ] Verified WiFi connected (Serial: `STATUS`)
- [ ] API key stored in firmware (Serial: `STATUS` shows ✓ Present)
- [ ] Pump ID matches between config and registration

---

## 📊 Request Format (Exact)

**Method:** `POST`
**URL:** `http://10.126.234.42:3000/api/pumps/data`

**Headers** (REQUIRED):
```
Content-Type: application/json
x-api-key: 9f3d5e2a1b4c7e8f9g0h1i2j3k4l5m6n
```

**Body** (JSON - all fields optional except pumpId):
```json
{
  "pumpId": "PUMP-001",
  "liters": 12.5,
  "amount": 3500,
  "nozzle": 1,
  "fuelType": "PETROL",
  "timestamp": "2026-02-17T14:30:45Z"
}
```

---

## ✅ Success Indicators

### In Serial Monitor:
```
✅ WiFi connected!
✅ Registration successful!
   API Key: 9f3d5e2a1b4c...
▶️  Transaction started!
📤 Sending transaction to backend...
✅ Data sent successfully!
```

### In Backend Logs:
```
✅ [ApiKeyGuard] Authentication successful for pump: PUMP-001
📥 [PumpsController] Received pump data from PUMP-001
✅ [PumpsController] Successfully saved transaction for PUMP-001
```

---

## ❌ Error Reference

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid authorization header` | Missing `x-api-key` header | Add header to request |
| `Invalid API key` | API key not in database | Re-register pump |
| `Pump ID mismatch` | Body pumpId ≠ registered pumpId | Match IDs |
| `WiFi disconnected` | Lost connection to network | Check WiFi credentials |
| `HTTP 400` | Validation error in request body | Check timestamp format (ISO 8601) |

---

## 🚀 Next Steps

1. **In Arduino IDE:**
   - Verify PUMP_ID, WiFi credentials, SERVER_IP
   - Upload sketch to ESP8266

2. **In Serial Monitor (115200 baud):**
   - Type: `REGISTER` → Wait for API key
   - Type: `STATUS` → Verify WiFi + registration
   - Type: `TEST` → Send test transaction

3. **If TEST fails:**
   - Check backend logs (see full guide)
   - Verify API key format (no spaces/typos)
   - Re-register pump

4. **When TEST succeeds:**
   - Connect fuel pump sensors
   - Monitor actual transactions
   - Check backend logs for data arrival

---

**Full debugging guide:** See `API_AUTHENTICATION_DEBUG_GUIDE.md`
