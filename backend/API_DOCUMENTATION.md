# Fuel Pump Management System - API Documentation

## 🏗️ Architecture Overview

This is a production-ready NestJS backend for managing fuel pumps in real petrol stations. Each pump has an ESP8266 Wi-Fi module that sends transaction data to this backend.

## 📊 Database Schema

### Models

1. **User** - Station owners/admins
   - Can own multiple stations
   - Email/password authentication
   - Role-based access (ADMIN, etc.)

2. **Station** - Petrol stations
   - Belongs to a User (owner)
   - Has multiple pumps
   - Name and location

3. **Pump** - Individual fuel pumps
   - Unique `pumpId` (e.g., "PUMP001")
   - Unique `apiKey` for authentication
   - Belongs to a Station
   - Has many transactions

4. **PumpData** - Transaction records
   - `liters` - Fuel dispensed
   - `amount` - Transaction amount
   - `nozzle` - Nozzle number (1, 2, 3...)
   - `fuelType` - Type of fuel (Petrol, Diesel, etc.)
   - `timestamp` - When transaction occurred

## 🔐 Authentication

### API Key Authentication (for Pumps)
- Header: `x-api-key: <PUMP_API_KEY>`
- Used by ESP8266 modules to submit data
- Validates that `pumpId` matches the API key

### JWT Authentication (for Users)
- Standard email/password login
- Returns JWT token for admin dashboard access

## 📡 API Endpoints

### Pump Registration

#### `POST /api/pumps/register`
Register a new pump and receive an API key for authentication.

**Endpoint URL:**
```
POST http://192.168.100.20:3000/api/pumps/register
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "pumpId": "PUMP001",
  "stationId": "optional-station-uuid"
}
```

**Response (New Registration):**
```json
{
  "success": true,
  "message": "Pump registered successfully",
  "pumpId": "PUMP001",
  "apiKey": "a1b2c3d4e5f6...",
  "station": {
    "id": "uuid",
    "name": "Main Station",
    "location": "Downtown"
  },
  "registered": true
}
```

**Response (Already Registered):**
```json
{
  "success": true,
  "message": "Pump already registered",
  "pumpId": "PUMP001",
  "apiKey": "a1b2c3d4e5f6...",
  "registered": false
}
```

**Error Responses:**
- `400 Bad Request` - Invalid pumpId format or missing required fields
- `404 Not Found` - Station ID not found (if provided)

**Notes:**
- `pumpId` must be unique and can only contain alphanumeric characters, dashes, and underscores
- `stationId` is optional - pumps can be registered without a station initially
- If the pump already exists, the existing API key is returned
- API keys are cryptographically secure and unique per pump

---

### Pump Data Submission

#### `POST /api/pumps/data`
Submit transaction data from a fuel pump. The pump must be registered first.

**Endpoint URL:**
```
POST http://192.168.100.20:3000/api/pumps/data
```

**Endpoint URL:**
```
POST http://192.168.100.20:3000/api/pumps/data
```

**Headers:**
```
x-api-key: <PUMP_API_KEY>
Content-Type: application/json
```

**Request Body:**
```json
{
  "pumpId": "PUMP001",
  "liters": 5.23,
  "amount": 1520,
  "nozzle": 1,
  "fuelType": "PETROL",
  "timestamp": "2026-01-25T10:00:00Z",
  "stationId": "optional-station-uuid"
}
```

**Field Validation:**
- `pumpId` (required): Must match the pump associated with the API key
- `liters` (required): Number between 0 and 10000
- `amount` (required): Number between 0 and 1000000
- `nozzle` (required): Integer between 1 and 10
- `fuelType` (required): Must be `PETROL` or `DIESEL`
- `timestamp` (required): Valid ISO 8601 date string, cannot be more than 5 minutes in the future
- `stationId` (optional): If provided, must match the pump's station

**Response:**
```json
{
  "id": "uuid",
  "pumpId": "PUMP001",
  "liters": 5.23,
  "amount": 1520,
  "nozzle": 1,
  "fuelType": "Petrol",
  "timestamp": "2026-01-25T10:00:00Z",
  "createdAt": "2026-01-25T10:00:01Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing API key, or pump not registered
- `400 Bad Request` - Invalid data format, pumpId mismatch, or validation errors:
  - Pump ID mismatch: The API key belongs to a different pump
  - Station ID mismatch: The provided stationId doesn't match the pump's station
  - Invalid timestamp: Timestamp format is invalid or too far in the future
  - Invalid values: Negative numbers, out-of-range values, etc.

---

### Admin APIs

#### `GET /api/pumps`
Get all pumps with their latest transaction.

**Response:**
```json
[
  {
    "id": "uuid",
    "pumpId": "PUMP001",
    "stationId": "uuid",
    "station": {
      "id": "uuid",
      "name": "Main Station",
      "location": "Downtown"
    },
    "data": [
      {
        "liters": 5.23,
        "amount": 1520,
        "timestamp": "2026-01-25T10:00:00Z"
      }
    ]
  }
]
```

#### `GET /api/pumps/:pumpId`
Get specific pump details with station info and recent transactions.

**Response:**
```json
{
  "id": "uuid",
  "pumpId": "PUMP001",
  "station": {
    "id": "uuid",
    "name": "Main Station",
    "location": "Downtown",
    "owner": {
      "id": "uuid",
      "email": "owner@example.com"
    }
  },
  "data": [
    {
      "liters": 5.23,
      "amount": 1520,
      "nozzle": 1,
      "fuelType": "Petrol",
      "timestamp": "2026-01-25T10:00:00Z"
    }
  ]
}
```

#### `GET /api/pumps/:pumpId/data?limit=100`
Get historical transaction data for a pump.

**Query Parameters:**
- `limit` (optional) - Number of records to return (default: 100)

**Response:**
```json
[
  {
    "id": "uuid",
    "pumpId": "PUMP001",
    "liters": 5.23,
    "amount": 1520,
    "nozzle": 1,
    "fuelType": "Petrol",
    "timestamp": "2026-01-25T10:00:00Z",
    "createdAt": "2026-01-25T10:00:01Z"
  }
]
```

---

### Analytics APIs

#### `GET /api/analytics/liters-statistics?pumpId=PUMP001`
Get statistics about fuel dispensed (liters).

**Query Parameters:**
- `pumpId` (optional) - Filter by specific pump

**Response:**
```json
{
  "average": 42.3,
  "min": 10.0,
  "max": 50.0,
  "total": 4230.0,
  "count": 100
}
```

#### `GET /api/analytics/amount-statistics?pumpId=PUMP001`
Get statistics about transaction amounts.

**Response:**
```json
{
  "average": 1250.5,
  "min": 500.0,
  "max": 2000.0,
  "total": 125050.0,
  "count": 100
}
```

#### `GET /api/analytics/fuel-type-distribution?pumpId=PUMP001`
Get distribution of transactions by fuel type.

**Response:**
```json
{
  "Petrol": 60,
  "Diesel": 35,
  "Premium": 5
}
```

#### `GET /api/analytics/nozzle-distribution?pumpId=PUMP001`
Get distribution of transactions by nozzle number.

**Response:**
```json
{
  "1": 25,
  "2": 30,
  "3": 20,
  "4": 25
}
```

#### `GET /api/analytics/time-series?pumpId=PUMP001&hours=24`
Get time series data for the last N hours.

**Query Parameters:**
- `pumpId` (optional) - Filter by specific pump
- `hours` (optional) - Number of hours to look back (default: 24)

**Response:**
```json
[
  {
    "id": "uuid",
    "pumpId": "PUMP001",
    "liters": 5.23,
    "amount": 1520,
    "nozzle": 1,
    "fuelType": "Petrol",
    "timestamp": "2026-01-25T10:00:00Z"
  }
]
```

---

## 🔧 ESP8266 Integration Example

### Step 1: Register Your Pump

```javascript
// First, register your pump to get an API key
const pumpId = "PUMP001";
const registerUrl = "http://192.168.100.20:3000/api/pumps/register";

fetch(registerUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    pumpId: pumpId,
    stationId: "optional-station-uuid" // Optional
  })
})
.then(response => response.json())
.then(data => {
  console.log('Pump registered! API Key:', data.apiKey);
  // Store this API key securely in your ESP8266 module
  const apiKey = data.apiKey;
})
.catch(error => console.error('Registration error:', error));
```

### Step 2: Send Transaction Data

```javascript
// Use the API key received from registration
const pumpId = "PUMP001";
const apiKey = "your-api-key-from-registration";
const serverUrl = "http://192.168.100.20:3000/api/pumps/data";

// When transaction completes
function sendTransactionData(liters, amount, nozzle, fuelType) {
  const data = {
    pumpId: pumpId,
    liters: liters,
    amount: amount,
    nozzle: nozzle,
    fuelType: fuelType,
    timestamp: new Date().toISOString()
  };

  fetch(serverUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => console.log('Transaction saved:', data))
  .catch(error => console.error('Error:', error));
}
```

## 🚀 Setup & Deployment

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Setup Database:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

3. **Configure Environment:**
   Copy `.env.example` to `.env` and update:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/fuel_analyser"
   JWT_SECRET="your-secret-key"
   ```

4. **Run Development Server:**
   ```bash
   npm run start:dev
   ```

5. **Build for Production:**
   ```bash
   npm run build
   npm run start:prod
   ```

## 🐳 Docker Deployment

```bash
docker build -t fuel-pump-backend .
docker run -p 3000:3000 --env-file .env fuel-pump-backend
```

## 📝 Notes

- All timestamps are in ISO 8601 format
- API key must match the pumpId in the request body
- Validation is enabled on all DTOs
- Database indexes are on `pumpId` and `timestamp` for performance
- CORS is enabled for frontend access










