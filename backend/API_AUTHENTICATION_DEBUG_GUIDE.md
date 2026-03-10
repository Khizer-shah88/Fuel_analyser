# API Authentication Debug Guide

## 🔐 Troubleshooting 401 Unauthorized Errors

### Issue Summary
Your ESP8266 module is receiving a **401 Unauthorized** error with message `"Invalid authorization header"` when sending pump transaction data to `/api/pumps/data`.

---

## ✅ What We Fixed

### 1. **Added Comprehensive Debug Logging**
The backend now includes detailed logging at every authentication step:

- **ApiKeyGuard** logs all incoming headers
- **AuthService** logs API key validation with database lookups
- **PumpsController** logs incoming requests and responses

### 2. **Verified Header Format**
The backend expects the **`x-api-key`** header format:
```
x-api-key: YOUR_API_KEY_HERE
```

### 3. **Confirmed Optional Fields**b
All pump data fields are now optional in DTOs:
- `liters` ✓ optional
- `amount` ✓ optional
- `nozzle` ✓ optional
- `fuelType` ✓ optional
- `timestamp` ✓ optional (but recommended for accurate data)
- `pumpId` ✓ required (for identification)

---

## 🔍 Diagnosis Steps

### Step 1: Check Backend Logs

When your ESP8266 sends data, check the backend console for debug output:

```
🔍 [API Key Guard] Incoming headers:
{
  "host": "10.126.234.42:3000",
  "connection": "close",
  "content-length": "156",
  "content-type": "application/json",
  "x-api-key": "YOUR_API_KEY_HERE..."
}
```

**What to look for:**
- ✅ `x-api-key` header is present
- ✅ API key value is not empty
- ❌ If `x-api-key` is missing → Problem with ESP8266 header transmission
- ❌ If value is empty → API key not being stored correctly

### Step 2: API Key Lookup

Backend will log:
```
🔍 [AuthService] Looking up pump by API key: abc123def456...
✅ [AuthService] Pump found: PUMP-001
```

**If pump is NOT found:**
```
❌ [AuthService] No pump found with API key: abc123def456...
Total pumps in database: 2
Existing pumps:
  - PUMP-001: API Key 9f3d5e2a1b4c...
  - PUMP-002: API Key 7c2e9a1f5b3d...
```

This means the API key stored in database doesn't match what the ESP8266 is sending.

---

## 📋 Testing Steps

### Test 1: Verify Pump Registration

First, ensure your pump is properly registered:

#### Using cURL:
```bash
curl -X POST http://10.126.234.42:3000/api/pumps/register \
  -H "Content-Type: application/json" \
  -d '{
    "pumpId": "PUMP-001",
    "stationId": "STATION-A"
  }'
```

**Expected Response:**
```json
{
  "pumpId": "PUMP-001",
  "stationId": "STATION-A",
  "apiKey": "9f3d5e2a1b4c7e8f9g0h1i2j3k4l5m6n",
  "registered": false
}
```

**Save this API key** - you'll need it for the ESP8266 config.

#### Using Postman:
1. Create new POST request to `http://10.126.234.42:3000/api/pumps/register`
2. Set Body to JSON:
   ```json
   {
     "pumpId": "PUMP-001",
     "stationId": "STATION-A"
   }
   ```
3. Click Send
4. Copy the `apiKey` from the response

---

### Test 2: Send Test Transaction (with correct headers)

#### Using cURL:
```bash
curl -X POST http://10.126.234.42:3000/api/pumps/data \
  -H "Content-Type: application/json" \
  -H "x-api-key: 9f3d5e2a1b4c7e8f9g0h1i2j3k4l5m6n" \
  -d '{
    "pumpId": "PUMP-001",
    "liters": 12.5,
    "amount": 3500,
    "nozzle": 1,
    "fuelType": "PETROL",
    "timestamp": "2026-02-17T14:30:45Z"
  }'
```

**Expected Response (Success):**
```json
{
  "id": 1,
  "pumpId": "PUMP-001",
  "liters": 12.5,
  "amount": 3500,
  "nozzle": 1,
  "fuelType": "PETROL",
  "timestamp": "2026-02-17T14:30:45Z",
  "createdAt": "2026-02-17T14:31:22Z"
}
```

**Expected Response (401 Error):**
```json
{
  "error": "Invalid authorization header",
  "message": "Invalid API key. Pump not found or API key is incorrect.",
  "details": {
    "apiKeyProvided": "abc123def456...",
    "suggestion": "Verify the API key was correctly returned during pump registration."
  }
}
```

---

#### Using Postman:

1. **Create new request**: `POST` to `http://10.126.234.42:3000/api/pumps/data`

2. **Set Headers** tab:
   | Key | Value |
   |-----|-------|
   | `Content-Type` | `application/json` |
   | `x-api-key` | `9f3d5e2a1b4c7e8f9g0h1i2j3k4l5m6n` |

3. **Set Body** to raw JSON:
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

4. **Click Send**

---

### Test 3: Common Error Scenarios

#### Scenario A: Missing x-api-key Header
```bash
curl -X POST http://10.126.234.42:3000/api/pumps/data \
  -H "Content-Type: application/json" \
  -d '{"pumpId": "PUMP-001", "liters": 12.5}'
```

**Response:**
```json
{
  "error": "Invalid authorization header",
  "message": "API key is required. Please provide x-api-key header.",
  "details": {
    "headerReceived": false,
    "expectedFormat": "x-api-key: <your-api-key>"
  }
}
```

**Fix**: Add `x-api-key` header to ESP8266 request

---

#### Scenario B: Invalid/Expired API Key
```bash
curl -X POST http://10.126.234.42:3000/api/pumps/data \
  -H "Content-Type: application/json" \
  -H "x-api-key: wrong-api-key" \
  -d '{"pumpId": "PUMP-001", "liters": 12.5}'
```

**Response:**
```json
{
  "error": "Invalid authorization header",
  "message": "Invalid API key. Pump not found or API key is incorrect.",
  "details": {
    "apiKeyProvided": "wrong-api-...",
    "suggestion": "Verify the API key was correctly returned during pump registration."
  }
}
```

**Fix**: 
1. Re-register pump to get fresh API key
2. Update ESP8266 config with new key

---

#### Scenario C: Pump ID Mismatch
```bash
curl -X POST http://10.126.234.42:3000/api/pumps/data \
  -H "Content-Type: application/json" \
  -H "x-api-key: 9f3d5e2a1b4c7e8f9g0h1i2j3k4l5m6n" \
  -d '{
    "pumpId": "PUMP-DIFFERENT",
    "liters": 12.5
  }'
```

**Response:**
```json
{
  "error": "Bad Request",
  "message": "Pump ID mismatch. The API key belongs to pump 'PUMP-001', but the request specifies 'PUMP-DIFFERENT'."
}
```

**Fix**: Ensure `pumpId` in ESP8266 code matches the one used during registration

---

## 🔧 ESP8266 Configuration Checklist

Before sending requests from ESP8266:

### ✓ Registration Step (Do This First)

```cpp
// In ESP01_Pump_Module_Production.ino, lines 40-45
const String PUMP_ID = "PUMP-001";           // Must be unique per pump
const String STATION_ID = "";                // Optional
```

1. Upload sketch to ESP8266
2. Open Serial Monitor (115200 baud)
3. Watch for registration output:
   ```
   📝 Registering pump with backend server...
   ✅ Registration successful!
   API Key: 9f3d5e2a1b4c7e8f9g0h1i2j3k4l5m6n...
   ```

### ✓ Copy API Key

Once registered, the backend will print:
```
✅ Registration successful!
API Key: 9f3d5e2a1b4c7e8f9g0h1i2j3k4l5m6n...
```

This key is stored in the ESP8266 firmware variable `apiKey`.

### ✓ Send Transaction

When pump detects fuel dispensing, it will:
1. Send request with `x-api-key` header
2. Log response in Serial Monitor:
   ```
   📤 Sending transaction to backend...
   ✅ Data sent successfully!
   ```

---

## 🐛 Debugging in Real-Time

### Enable Backend Debug Logs

Set environment variable or update `main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    // ... existing config
  }),
);

// Add at bootstrap:
app.useLogger(['log', 'error', 'warn', 'debug']); // Show all logs including debug
```

### Monitor Backend Logs While Testing

```bash
# Terminal 1: Start backend with debug logging
cd backend
npm run start:dev

# Terminal 2: Send test request
curl -X POST http://10.126.234.42:3000/api/pumps/data \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"pumpId": "PUMP-001", "liters": 12.5, "timestamp": "2026-02-17T14:30:45Z"}'
```

### Expected Backend Output

```
[12:45:30] LOG [NestFactory] Starting Nest application...
[12:45:32] LOG [ApiKeyGuard] 🔍 Incoming headers logged...
[12:45:32] LOG [AuthService] ✅ Pump found: PUMP-001
[12:45:32] LOG [PumpsController] 📥 Received pump data from PUMP-001
[12:45:32] LOG [PumpsService] 💾 Saving transaction to database: PUMP-001
[12:45:32] LOG [PumpsController] ✅ Successfully saved transaction for PUMP-001: 12.5L
```

---

## 📊 Request/Response Format Reference

### Pump Registration

**Endpoint:** `POST /api/pumps/register`

**Request:**
```json
{
  "pumpId": "PUMP-001",
  "stationId": "STATION-A"
}
```

**Response:**
```json
{
  "pumpId": "PUMP-001",
  "stationId": "STATION-A",
  "apiKey": "9f3d5e2a1b4c7e8f9g0h1i2j3k4l5m6n",
  "registered": false
}
```

---

### Send Transaction Data

**Endpoint:** `POST /api/pumps/data`

**Required Headers:**
```
Content-Type: application/json
x-api-key: 9f3d5e2a1b4c7e8f9g0h1i2j3k4l5m6n
```

**Request Body (All fields optional except pumpId):**
```json
{
  "pumpId": "PUMP-001",
  "liters": 12.5,
  "amount": 3500,
  "nozzle": 1,
  "fuelType": "PETROL",
  "timestamp": "2026-02-17T14:30:45Z",
  "stationId": "STATION-A"
}
```

**Response (Success - 200/201):**
```json
{
  "id": 1,
  "pumpId": "PUMP-001",
  "liters": 12.5,
  "amount": 3500,
  "nozzle": 1,
  "fuelType": "PETROL",
  "timestamp": "2026-02-17T14:30:45Z",
  "stationId": "STATION-A",
  "createdAt": "2026-02-17T14:31:22Z"
}
```

**Response (Error - 401):**
```json
{
  "error": "Invalid authorization header",
  "message": "Invalid API key. Pump not found or API key is incorrect.",
  "statusCode": 401
}
```

**Response (Error - 400):**
```json
{
  "error": "Bad Request",
  "message": "Pump ID mismatch or validation error",
  "statusCode": 400
}
```

---

## 🎯 Quick Troubleshooting Flowchart

```
Getting 401 Unauthorized?
│
├─→ Is x-api-key header present?
│   ├─ NO → Add header to ESP8266 request
│   └─ YES → Continue
│
├─→ Does x-api-key have a value?
│   ├─ NO/Empty → Pump registration failed, re-register
│   └─ YES → Continue
│
├─→ Did you register the pump first?
│   ├─ NO → Run /api/pumps/register endpoint
│   └─ YES → Continue
│
├─→ Does pumpId in request match registered pump?
│   ├─ NO → Update ESP8266 PUMP_ID constant
│   └─ YES → Continue
│
└─→ Is the API key exactly as returned from registration?
    ├─ NO → Copy exact API key from registration response
    └─ YES → Check backend logs with debug enabled
```

---

## 📝 Sample Implementation (ESP8266)

Confirm your ESP8266 code matches this pattern:

```cpp
// Configuration (lines 40-75)
const String PUMP_ID = "PUMP-001";
const char* SERVER_IP = "10.126.234.42";
const int SERVER_PORT = 3000;

// Registration (in registerPumpWithBackend())
String apiKey = "";  // Will be filled from registration response
if (responseDoc.containsKey("apiKey")) {
  apiKey = responseDoc["apiKey"].as<String>();
}

// Send Data (in sendTransactionData())
http.addHeader("Content-Type", "application/json");
http.addHeader("x-api-key", apiKey);  // ← CRITICAL: x-api-key header

DynamicJsonDocument doc(512);
doc["pumpId"] = PUMP_ID;
doc["liters"] = currentTxn.liters;
// ... other fields

String payload;
serializeJson(doc, payload);
int httpCode = http.POST(payload);
```

---

## 🔄 Next Steps

1. **Restart backend** with debug logging enabled
2. **Trigger ESP8266 registration** - watch Serial Monitor
3. **Copy the returned API key**
4. **Send test transaction** from Postman/cURL
5. **Compare headers** in backend logs
6. **Verify pump ID** matches registered pump
7. **Monitor responses** for detailed error messages

---

## 📞 Support Information

**If 401 still occurs after these steps:**

1. Check backend logs for exact error message
2. Verify API key hasn't expired (re-register if needed)
3. Ensure `x-api-key` header is spelled correctly (case-sensitive)
4. Confirm WiFi connectivity on ESP8266 (check Serial Monitor)
5. Test with cURL/Postman first to isolate ESP8266 vs backend issue

---

**Last Updated:** February 17, 2026
**Backend Version:** NestJS with enhanced ApiKeyGuard logging
**Status:** Production Ready with Debug Enhancements
