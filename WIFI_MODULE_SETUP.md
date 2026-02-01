# WiFi Module Setup Guide

## 🚀 Quick Start

### Step 1: Register Your Pump

Before sending data, you must register your pump to receive an API key:

```bash
curl -X POST http://192.168.100.20:3000/api/pumps/register \
  -H "Content-Type: application/json" \
  -d '{
    "pumpId": "PUMP-001",
    "stationId": "optional-station-uuid"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Pump registered successfully",
  "pumpId": "PUMP-001",
  "apiKey": "a1b2c3d4e5f6...",
  "registered": true
}
```

**⚠️ Important:** Save the `apiKey` securely - you'll need it for all data submissions!

### Step 2: Send Transaction Data

Once registered, use your API key to send data:

## 📡 API Endpoint for Pump Data

Your WiFi modules should send data to:

```
POST http://192.168.100.20:3000/api/pumps/data
```

## 🔑 Required Headers

```
x-api-key: YOUR_PUMP_API_KEY
Content-Type: application/json
```

## 📦 Request Body Format

```json
{
  "pumpId": "PUMP-001",
  "liters": 5.2,
  "amount": 1400,
  "nozzle": 1,
  "fuelType": "PETROL",
  "timestamp": "2026-01-25T14:30:00Z"
}
```

## 🔧 Example cURL Command

```bash
curl -X POST http://192.168.100.20:3000/api/pumps/data \
-H "Content-Type: application/json" \
-H "x-api-key: YOUR_PUMP_API_KEY" \
-d '{
  "pumpId": "PUMP-001",
  "liters": 5.2,
  "amount": 1400,
  "nozzle": 1,
  "fuelType": "PETROL",
  "timestamp": "2026-01-25T14:30:00Z"
}'
```

## 📝 Field Descriptions

- **pumpId**: Unique identifier for your pump (e.g., "PUMP-001", "PUMP-002")
- **liters**: Amount of fuel dispensed in liters (decimal number)
- **amount**: Transaction amount in your currency (decimal number)
- **nozzle**: Nozzle number (integer, minimum 1)
- **fuelType**: Type of fuel (string, e.g., "PETROL", "DIESEL", "PREMIUM")
- **timestamp**: ISO 8601 format timestamp (e.g., "2026-01-25T14:30:00Z")

## ⚠️ Important Notes

1. **Registration Required**: Pumps must be registered first using `/api/pumps/register` to receive an API key
2. **API Key**: Each pump has a unique, cryptographically secure API key
3. **Pump ID Match**: The `pumpId` in the request body must match the pump associated with the API key
4. **Timestamp**: Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ), cannot be more than 5 minutes in the future
5. **Validation**: 
   - `liters`: 0 to 10000
   - `amount`: 0 to 1000000
   - `nozzle`: 1 to 10
   - `fuelType`: Must be `PETROL` or `DIESEL`

## ✅ Success Response

```json
{
  "id": "uuid",
  "pumpId": "PUMP-001",
  "liters": 5.2,
  "amount": 1400,
  "nozzle": 1,
  "fuelType": "PETROL",
  "timestamp": "2026-01-25T14:30:00Z",
  "createdAt": "2026-01-25T14:30:01Z"
}
```

## ❌ Error Responses

- **401 Unauthorized**: 
  - Invalid or missing API key
  - Pump not registered
  - API key doesn't match any pump
- **400 Bad Request**: 
  - Pump ID mismatch (API key belongs to different pump)
  - Invalid data format or out-of-range values
  - Invalid timestamp (format error or too far in future)
  - Station ID mismatch (if provided)

## 🔄 Real-Time Updates

Once data is successfully submitted:
- Data is stored in the database immediately
- Frontend dashboard auto-refreshes every 10 seconds
- New transactions appear automatically on the dashboard

