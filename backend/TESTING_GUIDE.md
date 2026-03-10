# Testing Guide

This guide provides step-by-step instructions for testing the pump registration and data submission endpoints.

## Prerequisites

1. Backend server running on port 3000
2. Database connected and migrations applied
3. `curl` or Postman installed

## Test Flow

### Step 1: Register a Pump

Register a new pump to receive an API key:

```bash
curl -X POST http://localhost:3000/api/pumps/register \
  -H "Content-Type: application/json" \
  -d '{
    "pumpId": "TEST-PUMP-001",
    "stationId": null
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Pump registered successfully",
  "pumpId": "TEST-PUMP-001",
  "apiKey": "a1b2c3d4e5f6...",
  "station": null,
  "registered": true
}
```

**Save the `apiKey` from the response - you'll need it for the next step!**

### Step 2: Test Data Submission

Use the API key from Step 1 to submit transaction data:

```bash
curl -X POST http://localhost:3000/api/pumps/data \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_FROM_STEP_1" \
  -d '{
    "pumpId": "TEST-PUMP-001",
    "liters": 5.23,
    "amount": 1520,
    "nozzle": 1,
    "fuelType": "PETROL",
    "timestamp": "2026-01-30T20:00:00Z"
  }'
```

**Expected Response:**
```json
{
  "id": "uuid",
  "pumpId": "TEST-PUMP-001",
  "liters": 5.23,
  "amount": 1520,
  "nozzle": 1,
  "fuelType": "PETROL",
  "timestamp": "2026-01-30T20:00:00Z",
  "createdAt": "2026-01-30T20:00:01Z"
}
```

## Error Testing

### Test 1: Missing API Key

```bash
curl -X POST http://localhost:3000/api/pumps/data \
  -H "Content-Type: application/json" \
  -d '{
    "pumpId": "TEST-PUMP-001",
    "liters": 5.23,
    "amount": 1520,
    "nozzle": 1,
    "fuelType": "PETROL",
    "timestamp": "2026-01-30T20:00:00Z"
  }'
```

**Expected:** `401 Unauthorized` - "API key is required..."

### Test 2: Invalid API Key

```bash
curl -X POST http://localhost:3000/api/pumps/data \
  -H "Content-Type: application/json" \
  -H "x-api-key: invalid-key-12345" \
  -d '{
    "pumpId": "TEST-PUMP-001",
    "liters": 5.23,
    "amount": 1520,
    "nozzle": 1,
    "fuelType": "PETROL",
    "timestamp": "2026-01-30T20:00:00Z"
  }'
```

**Expected:** `401 Unauthorized` - "Invalid API key..."

### Test 3: Pump ID Mismatch

```bash
curl -X POST http://localhost:3000/api/pumps/data \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_VALID_API_KEY" \
  -d '{
    "pumpId": "DIFFERENT-PUMP-ID",
    "liters": 5.23,
    "amount": 1520,
    "nozzle": 1,
    "fuelType": "PETROL",
    "timestamp": "2026-01-30T20:00:00Z"
  }'
```

**Expected:** `400 Bad Request` - "Pump ID mismatch..."

### Test 4: Invalid Data Values

```bash
curl -X POST http://localhost:3000/api/pumps/data \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_VALID_API_KEY" \
  -d '{
    "pumpId": "TEST-PUMP-001",
    "liters": -5.23,
    "amount": 1520,
    "nozzle": 1,
    "fuelType": "PETROL",
    "timestamp": "2026-01-30T20:00:00Z"
  }'
```

**Expected:** `400 Bad Request` - "liters must be non-negative"

### Test 5: Invalid Fuel Type

```bash
curl -X POST http://localhost:3000/api/pumps/data \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_VALID_API_KEY" \
  -d '{
    "pumpId": "TEST-PUMP-001",
    "liters": 5.23,
    "amount": 1520,
    "nozzle": 1,
    "fuelType": "INVALID_TYPE",
    "timestamp": "2026-01-30T20:00:00Z"
  }'
```

**Expected:** `400 Bad Request` - "fuelType must be either PETROL or DIESEL"

### Test 6: Future Timestamp

```bash
curl -X POST http://localhost:3000/api/pumps/data \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_VALID_API_KEY" \
  -d '{
    "pumpId": "TEST-PUMP-001",
    "liters": 5.23,
    "amount": 1520,
    "nozzle": 1,
    "fuelType": "PETROL",
    "timestamp": "2030-01-30T20:00:00Z"
  }'
```

**Expected:** `400 Bad Request` - "Timestamp cannot be more than 5 minutes in the future"

## Testing with Postman

### Collection Setup

1. Create a new collection: "Fuel Pump API"
2. Add environment variables:
   - `base_url`: `http://localhost:3000/api`
   - `api_key`: (will be set after registration)

### Request 1: Register Pump

- **Method:** POST
- **URL:** `{{base_url}}/pumps/register`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "pumpId": "TEST-PUMP-001"
}
```

### Request 2: Submit Data

- **Method:** POST
- **URL:** `{{base_url}}/pumps/data`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{api_key}}`
- **Body (raw JSON):**
```json
{
  "pumpId": "TEST-PUMP-001",
  "liters": 5.23,
  "amount": 1520,
  "nozzle": 1,
  "fuelType": "PETROL",
  "timestamp": "2026-01-30T20:00:00Z"
}
```

## Production Server Testing

Replace `localhost:3000` with your production server IP:

```bash
# Register
curl -X POST http://192.168.100.20:3000/api/pumps/register \
  -H "Content-Type: application/json" \
  -d '{"pumpId": "PUMP-001"}'

# Submit Data
curl -X POST http://192.168.100.20:3000/api/pumps/data \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "pumpId": "PUMP-001",
    "liters": 5.23,
    "amount": 1520,
    "nozzle": 1,
    "fuelType": "PETROL",
    "timestamp": "2026-01-30T20:00:00Z"
  }'
```

## Verification

After successful data submission:

1. Check the frontend dashboard - data should appear within 10 seconds
2. Query the database directly:
   ```bash
   cd backend
   npm run prisma:studio
   ```
3. Use the admin API to fetch pump data:
   ```bash
   curl -X GET http://localhost:3000/api/pumps/TEST-PUMP-001/data \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## Notes

- All timestamps must be in ISO 8601 format
- API keys are case-sensitive
- Pump IDs must be unique
- Data validation is strict - ensure all values are within allowed ranges
- The system does NOT auto-create pumps - registration is required first










