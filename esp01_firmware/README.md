# ESP-01 Fuel Pump Firmware

ESP-01 firmware for sending fuel pump transaction data to the backend system.

## Overview

This firmware:
- Measures fuel dispensed using YF-S201 flow sensor
- **Receives fuel prices from the pump's physical control panel** (not from backend)
- Sends transaction data to the NestJS backend

## Price Source

**Prices come from the pump's physical control panel**, set by admin via buttons/remote.

The ESP-01 receives price updates from the pump controller via Serial:
```
P:290        → Set PETROL price to Rs290
D:295        → Set DIESEL price to Rs295
PRICE:290:295 → Set both prices
```

Prices are stored in EEPROM and survive power cycles.

## Files

| File | Purpose |
|------|---------|
| `fuel_pump_esp01.ino` | Main production firmware |
| `fuel_pump_test.ino` | Test version (no hardware needed) |

## Hardware Required

- ESP-01 (ESP8266) module
- YF-S201 Flow Sensor (Hall effect, 7.5 pulses/liter)
- 3.3V power supply
- USB-to-Serial adapter for programming

## Wiring Diagram

```
ESP-01 Module              Flow Sensor (YF-S201)
┌─────────────────┐        ┌──────────────────┐
│                 │        │                  │
│  GPIO0  ────────┼────────┤  Signal (Yellow) │
│                 │        │                  │
│  GND    ────────┼────────┤  GND (Black)     │
│                 │        │                  │
│                 │        │  VCC (Red) → 5V  │
│                 │        │                  │
│  VCC    ────────┼──┐     └──────────────────┘
│                 │  │
│  GPIO2  ────────┼──┼──── Status LED (optional)
│                 │  │
└─────────────────┘  └──── 3.3V Supply

ESP-01 RX ←── TX from Pump Controller
```

## Communication Protocol

### From Pump Controller (Serial @ 9600 baud)

The pump controller sends commands to update prices and transaction info:

```
P:290        → Set PETROL price
D:295        → Set DIESEL price
PRICE:290:295 → Set both prices
N:1          → Set nozzle number (1-10)
F:PETROL     → Set fuel type
F:DIESEL     → Set fuel type
```

### To Backend (HTTP POST)

```json
{
  "pumpId": "PUMP001",
  "liters": "5.50",
  "amount": "1595",
  "nozzle": 1,
  "fuelType": "PETROL",
  "timestamp": "2026-03-09T10:30:45Z"
}
```

## Configuration

Edit these constants in the firmware:

```cpp
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

const char* SERVER_HOST = "192.168.100.20";
const int SERVER_PORT = 3000;

const char* PUMP_ID = "PUMP001";

const float DEFAULT_PETROL_PRICE = 290.0;
const float DEFAULT_DIESEL_PRICE = 295.0;
```

## Installation

1. Install Arduino IDE
2. Add ESP8266 board support
3. Install ArduinoJson library
4. Open the .ino file
5. Configure WiFi and server settings
6. Upload to ESP-01

## How It Works

1. **Boot**: ESP-01 connects to WiFi, loads saved prices from EEPROM
2. **Registration**: First boot registers with backend, receives API key
3. **Prices**: Receives price updates from pump controller via Serial
4. **Monitoring**: Counts flow sensor pulses when fuel is dispensing
5. **Transaction End**: When flow stops for 5 seconds, calculates and sends data
6. **Storage**: Prices stored in EEPROM survive power cycles

## Testing Without Hardware

Use `fuel_pump_test.ino`:

1. Upload to ESP-01
2. Open Serial Monitor (9600 baud)
3. Type commands:
   - `STATUS` - Show current status
   - `P:290` - Set petrol price
   - `D:295` - Set diesel price
   - `TEST` - Send test transaction (5.5L)
   - `TEST:10.5` - Send custom liters

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/pumps/register` | Register pump, get API key |
| `POST /api/pumps/data` | Submit transaction data |

## LED Indicators

- **Fast blink**: Processing/sending
- **2 blinks**: Price updated
- **3 blinks**: Registration successful
- **10 fast blinks**: Error

## Troubleshooting

| Issue | Solution |
|-------|----------|
| WiFi won't connect | Check credentials, signal strength |
| Registration fails | Verify backend is running |
| API returns 401 | Clear EEPROM and re-register |
| Wrong prices | Send new prices via Serial |
| Data not sending | Check WiFi, verify registration |

## Memory Layout (EEPROM)

| Address | Data |
|---------|------|
| 0-63 | API Key |
| 70-71 | Petrol price (int × 100) |
| 74 | Valid marker (0xAA) |
| 75-76 | Diesel price (int × 100) |

