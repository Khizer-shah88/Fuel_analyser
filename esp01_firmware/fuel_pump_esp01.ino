/*
 * ESP-01 Fuel Pump Data Logger Firmware
 * =====================================
 * 
 * Hardware: ESP-01 (ESP8266)
 * Purpose: Send fuel pump transaction data to backend API
 * 
 * PRICE SOURCE: Physical pump control panel (NOT from backend!)
 * The pump admin changes prices on the pump's physical buttons/remote.
 * This firmware reads the price from the pump's controller via Serial.
 * 
 * Wiring for ESP-01:
 * - VCC: 3.3V (NOT 5V!)
 * - GND: Ground
 * - GPIO0: Flow sensor pulse input (pulled HIGH for normal operation)
 * - GPIO2: Status LED (active LOW)
 * - RX: Connect to pump controller TX (receives price updates)
 * - TX: Debug output / Programming
 * 
 * Flow Sensor: Connect pulse output to GPIO0
 * - Typical: YF-S201 (7.5 pulses per liter)
 * - Or hall-effect sensor from pump
 * 
 * PRICE PROTOCOL (from pump controller via Serial at 9600 baud):
 * The pump's main controller sends price updates when admin changes them.
 * Format options:
 *   "P:290"         - Set PETROL price to 290
 *   "D:295"         - Set DIESEL price to 295
 *   "PRICE:290:295" - Set both (PETROL:DIESEL)
 *   "N:1" or "N:2"  - Set nozzle number
 *   "F:PETROL"      - Set fuel type
 *   "F:DIESEL"      - Set fuel type
 * 
 * Prices are stored in EEPROM and persist after power cycle.
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <EEPROM.h>

// ============================================
// CONFIGURATION - MODIFY THESE VALUES
// ============================================

// WiFi Credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Backend Server Configuration
const char* SERVER_HOST = "192.168.100.20";  // Your backend IP
const int SERVER_PORT = 3000;
const char* API_BASE_URL = "/api/pumps";

// Pump Configuration
const char* PUMP_ID = "PUMP001";           // Unique pump identifier
const char* STATION_ID = "";               // Optional: Leave empty if not assigned to station

// Flow Sensor Configuration
const float PULSES_PER_LITER = 7.5;        // Calibrate for your flow sensor (YF-S201 = 7.5)

// Default Fuel Prices (used on first boot, then stored in EEPROM)
const float DEFAULT_PETROL_PRICE = 290.0;
const float DEFAULT_DIESEL_PRICE = 295.0;

// Hardware Pins (ESP-01 has limited GPIO)
#define FLOW_SENSOR_PIN 0                   // GPIO0 - Flow sensor pulse input
#define STATUS_LED_PIN 2                    // GPIO2 - Built-in LED (active LOW)

// Timing Configuration
const unsigned long DEBOUNCE_DELAY = 5;           // ms - flow sensor debounce
const unsigned long TRANSACTION_TIMEOUT = 30000;  // ms - no flow = transaction complete
const unsigned long WIFI_RETRY_INTERVAL = 5000;   // ms - WiFi reconnection interval
const unsigned long API_RETRY_INTERVAL = 3000;    // ms - API retry interval
const int MAX_API_RETRIES = 3;                    // Maximum API retry attempts

// EEPROM Configuration
#define EEPROM_SIZE 512
#define API_KEY_ADDR 0
#define API_KEY_LENGTH 64
#define PETROL_PRICE_ADDR 70    // Store petrol price at address 70
#define DIESEL_PRICE_ADDR 75    // Store diesel price at address 75

// ============================================
// GLOBAL VARIABLES
// ============================================

// WiFi client
WiFiClient wifiClient;

// API Key storage (retrieved after registration)
char apiKey[API_KEY_LENGTH + 1] = "";
bool isRegistered = false;

// === FUEL PRICES (read from pump controller, stored in EEPROM) ===
float petrolPrice = DEFAULT_PETROL_PRICE;
float dieselPrice = DEFAULT_DIESEL_PRICE;

// Flow sensor variables
volatile unsigned long pulseCount = 0;
unsigned long lastPulseTime = 0;
unsigned long transactionStartTime = 0;
float totalLiters = 0.0;
bool transactionActive = false;

// Current transaction data
int currentNozzle = 1;                     // Default nozzle
String currentFuelType = "PETROL";         // Default fuel type

// Timing variables
unsigned long lastWiFiCheck = 0;
unsigned long lastActivityTime = 0;

// Serial buffer for receiving price commands from pump controller
String serialBuffer = "";

// ============================================
// INTERRUPT SERVICE ROUTINE
// ============================================

ICACHE_RAM_ATTR void flowSensorISR() {
  unsigned long currentTime = millis();
  
  if ((currentTime - lastPulseTime) > DEBOUNCE_DELAY) {
    pulseCount++;
    lastPulseTime = currentTime;
    lastActivityTime = currentTime;
    
    if (!transactionActive) {
      transactionActive = true;
      transactionStartTime = currentTime;
      totalLiters = 0.0;
    }
  }
}

// ============================================
// SETUP FUNCTION
// ============================================

void setup() {
  Serial.begin(9600);  // 9600 baud for pump controller communication
  delay(100);
  
  Serial.println();
  Serial.println("========================================");
  Serial.println("   ESP-01 Fuel Pump Data Logger");
  Serial.println("   Price from Pump Controller");
  Serial.println("========================================");
  Serial.printf("Pump ID: %s\n", PUMP_ID);
  Serial.println();

  pinMode(STATUS_LED_PIN, OUTPUT);
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
  digitalWrite(STATUS_LED_PIN, HIGH);
  
  EEPROM.begin(EEPROM_SIZE);
  loadApiKey();
  loadFuelPrices();
  
  connectToWiFi();
  
  if (WiFi.status() == WL_CONNECTED) {
    registerPump();
  }
  
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), flowSensorISR, FALLING);
  
  Serial.println("Setup complete. Monitoring fuel flow...");
  Serial.printf("Current Prices: PETROL=Rs%.0f, DIESEL=Rs%.0f\n", petrolPrice, dieselPrice);
  Serial.println("Waiting for price updates from pump controller...");
  Serial.println();
  
  blinkLED(3, 200);
}

// ============================================
// MAIN LOOP
// ============================================

void loop() {
  handlePumpControllerInput();
  maintainWiFiConnection();
  
  if (transactionActive) {
    noInterrupts();
    unsigned long currentPulses = pulseCount;
    interrupts();
    
    totalLiters = (float)currentPulses / PULSES_PER_LITER;
    
    if ((millis() - lastActivityTime) > TRANSACTION_TIMEOUT) {
      completeTransaction();
    }
    
    static unsigned long lastBlink = 0;
    if (millis() - lastBlink > 500) {
      digitalWrite(STATUS_LED_PIN, !digitalRead(STATUS_LED_PIN));
      lastBlink = millis();
    }
  }
  
  yield();
  delay(10);
}

// ============================================
// PUMP CONTROLLER COMMUNICATION
// ============================================

void handlePumpControllerInput() {
  while (Serial.available()) {
    char c = Serial.read();
    
    if (c == '\n' || c == '\r') {
      if (serialBuffer.length() > 0) {
        processControllerCommand(serialBuffer);
        serialBuffer = "";
      }
    } else {
      serialBuffer += c;
      if (serialBuffer.length() > 50) {
        serialBuffer = "";
      }
    }
  }
}

void processControllerCommand(String cmd) {
  cmd.trim();
  cmd.toUpperCase();
  
  Serial.printf("Received from pump: %s\n", cmd.c_str());
  
  // Set PETROL price: P:290
  if (cmd.startsWith("P:")) {
    float newPrice = cmd.substring(2).toFloat();
    if (newPrice > 0 && newPrice < 10000) {
      if (newPrice != petrolPrice) {
        Serial.printf("PETROL price updated: Rs%.0f -> Rs%.0f\n", petrolPrice, newPrice);
        petrolPrice = newPrice;
        saveFuelPrices();
        blinkLED(2, 100);
      }
    }
  }
  // Set DIESEL price: D:295
  else if (cmd.startsWith("D:")) {
    float newPrice = cmd.substring(2).toFloat();
    if (newPrice > 0 && newPrice < 10000) {
      if (newPrice != dieselPrice) {
        Serial.printf("DIESEL price updated: Rs%.0f -> Rs%.0f\n", dieselPrice, newPrice);
        dieselPrice = newPrice;
        saveFuelPrices();
        blinkLED(2, 100);
      }
    }
  }
  // Set both prices: PRICE:290:295
  else if (cmd.startsWith("PRICE:")) {
    String prices = cmd.substring(6);
    int colonPos = prices.indexOf(':');
    if (colonPos > 0) {
      float newPetrol = prices.substring(0, colonPos).toFloat();
      float newDiesel = prices.substring(colonPos + 1).toFloat();
      
      if (newPetrol > 0 && newPetrol < 10000) {
        petrolPrice = newPetrol;
        Serial.printf("PETROL price set to Rs%.0f\n", petrolPrice);
      }
      if (newDiesel > 0 && newDiesel < 10000) {
        dieselPrice = newDiesel;
        Serial.printf("DIESEL price set to Rs%.0f\n", dieselPrice);
      }
      saveFuelPrices();
      blinkLED(2, 100);
    }
  }
  // Set nozzle: N:1 or N:2
  else if (cmd.startsWith("N:")) {
    int nozzle = cmd.substring(2).toInt();
    if (nozzle >= 1 && nozzle <= 10) {
      currentNozzle = nozzle;
      Serial.printf("Nozzle set to %d\n", currentNozzle);
    }
  }
  // Set fuel type: F:PETROL or F:DIESEL
  else if (cmd.startsWith("F:")) {
    String fuelType = cmd.substring(2);
    fuelType.trim();
    if (fuelType == "PETROL" || fuelType == "DIESEL") {
      currentFuelType = fuelType;
      Serial.printf("Fuel type set to %s\n", currentFuelType.c_str());
    }
  }
  // Status request: STATUS
  else if (cmd == "STATUS") {
    Serial.println("=== PUMP STATUS ===");
    Serial.printf("PETROL: Rs%.0f/L\n", petrolPrice);
    Serial.printf("DIESEL: Rs%.0f/L\n", dieselPrice);
    Serial.printf("Nozzle: %d\n", currentNozzle);
    Serial.printf("Fuel Type: %s\n", currentFuelType.c_str());
    Serial.printf("WiFi: %s\n", WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
  }
  // Test transaction: TEST
  else if (cmd == "TEST") {
    simulateTransaction(5.5, currentNozzle, currentFuelType.c_str());
  }
}

// ============================================
// FUEL PRICE STORAGE (EEPROM)
// ============================================

void saveFuelPrices() {
  int petrolInt = (int)(petrolPrice * 100);
  int dieselInt = (int)(dieselPrice * 100);
  
  EEPROM.write(PETROL_PRICE_ADDR, petrolInt >> 8);
  EEPROM.write(PETROL_PRICE_ADDR + 1, petrolInt & 0xFF);
  EEPROM.write(DIESEL_PRICE_ADDR, dieselInt >> 8);
  EEPROM.write(DIESEL_PRICE_ADDR + 1, dieselInt & 0xFF);
  EEPROM.write(PETROL_PRICE_ADDR + 4, 0xAA);
  
  EEPROM.commit();
  Serial.println("Prices saved to EEPROM");
}

void loadFuelPrices() {
  if (EEPROM.read(PETROL_PRICE_ADDR + 4) != 0xAA) {
    Serial.println("No saved prices in EEPROM, using defaults");
    petrolPrice = DEFAULT_PETROL_PRICE;
    dieselPrice = DEFAULT_DIESEL_PRICE;
    return;
  }
  
  int petrolInt = (EEPROM.read(PETROL_PRICE_ADDR) << 8) | EEPROM.read(PETROL_PRICE_ADDR + 1);
  if (petrolInt > 0 && petrolInt < 1000000) {
    petrolPrice = petrolInt / 100.0;
  }
  
  int dieselInt = (EEPROM.read(DIESEL_PRICE_ADDR) << 8) | EEPROM.read(DIESEL_PRICE_ADDR + 1);
  if (dieselInt > 0 && dieselInt < 1000000) {
    dieselPrice = dieselInt / 100.0;
  }
  
  Serial.printf("Loaded prices from EEPROM: PETROL=Rs%.0f, DIESEL=Rs%.0f\n", petrolPrice, dieselPrice);
}

// ============================================
// WIFI FUNCTIONS
// ============================================

void connectToWiFi() {
  Serial.printf("Connecting to WiFi: %s", WIFI_SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
    digitalWrite(STATUS_LED_PIN, !digitalRead(STATUS_LED_PIN));
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" Connected!");
    Serial.printf("IP Address: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("Signal Strength: %d dBm\n", WiFi.RSSI());
    digitalWrite(STATUS_LED_PIN, HIGH);
  } else {
    Serial.println(" Failed!");
    Serial.println("Will retry in background...");
  }
}

void maintainWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    if (millis() - lastWiFiCheck > WIFI_RETRY_INTERVAL) {
      lastWiFiCheck = millis();
      Serial.println("WiFi disconnected. Reconnecting...");
      WiFi.reconnect();
    }
  }
}

// ============================================
// EEPROM FUNCTIONS (API KEY)
// ============================================

void saveApiKey(const char* key) {
  for (int i = 0; i < API_KEY_LENGTH; i++) {
    EEPROM.write(API_KEY_ADDR + i, 0);
  }
  for (int i = 0; i < strlen(key) && i < API_KEY_LENGTH; i++) {
    EEPROM.write(API_KEY_ADDR + i, key[i]);
  }
  EEPROM.commit();
}

void loadApiKey() {
  for (int i = 0; i < API_KEY_LENGTH; i++) {
    apiKey[i] = EEPROM.read(API_KEY_ADDR + i);
  }
  apiKey[API_KEY_LENGTH] = '\0';
  
  if (strlen(apiKey) > 10 && apiKey[0] != 0xFF) {
    Serial.printf("API key loaded: %s...\n", String(apiKey).substring(0, 8).c_str());
    isRegistered = true;
  } else {
    memset(apiKey, 0, sizeof(apiKey));
    isRegistered = false;
  }
}

void clearApiKey() {
  for (int i = 0; i < API_KEY_LENGTH; i++) {
    EEPROM.write(API_KEY_ADDR + i, 0xFF);
  }
  EEPROM.commit();
  memset(apiKey, 0, sizeof(apiKey));
  isRegistered = false;
}

// ============================================
// API FUNCTIONS
// ============================================

void registerPump() {
  if (WiFi.status() != WL_CONNECTED) return;
  if (isRegistered && strlen(apiKey) > 10) return;
  
  Serial.println("Registering pump with backend...");
  
  HTTPClient http;
  String url = String("http://") + SERVER_HOST + ":" + SERVER_PORT + API_BASE_URL + "/register";
  
  http.begin(wifiClient, url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000);
  
  StaticJsonDocument<256> doc;
  doc["pumpId"] = PUMP_ID;
  if (strlen(STATION_ID) > 0) doc["stationId"] = STATION_ID;
  
  String payload;
  serializeJson(doc, payload);
  
  int httpCode = http.POST(payload);
  
  if (httpCode == 200 || httpCode == 201) {
    String response = http.getString();
    StaticJsonDocument<512> responseDoc;
    if (!deserializeJson(responseDoc, response)) {
      if (responseDoc["success"].as<bool>()) {
        const char* receivedKey = responseDoc["apiKey"];
        if (receivedKey && strlen(receivedKey) > 0) {
          strncpy(apiKey, receivedKey, API_KEY_LENGTH);
          saveApiKey(apiKey);
          isRegistered = true;
          Serial.println("Pump registered successfully!");
          blinkLED(5, 100);
        }
      }
    }
  }
  http.end();
}

bool sendPumpData(float liters, float amount, int nozzle, const char* fuelType) {
  if (WiFi.status() != WL_CONNECTED) return false;
  if (!isRegistered || strlen(apiKey) == 0) {
    registerPump();
    return false;
  }
  
  HTTPClient http;
  String url = String("http://") + SERVER_HOST + ":" + SERVER_PORT + API_BASE_URL + "/data";
  
  http.begin(wifiClient, url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", apiKey);
  http.setTimeout(10000);
  
  String timestamp = getISOTimestamp();
  
  StaticJsonDocument<512> doc;
  doc["pumpId"] = PUMP_ID;
  doc["liters"] = serialized(String(liters, 2));
  doc["amount"] = serialized(String(amount, 0));
  doc["nozzle"] = nozzle;
  doc["fuelType"] = fuelType;
  doc["timestamp"] = timestamp;
  if (strlen(STATION_ID) > 0) doc["stationId"] = STATION_ID;
  
  String payload;
  serializeJson(doc, payload);
  Serial.printf("Sending: %s\n", payload.c_str());
  
  int retries = 0;
  bool success = false;
  
  while (retries < MAX_API_RETRIES && !success) {
    int httpCode = http.POST(payload);
    
    if (httpCode == 200 || httpCode == 201) {
      Serial.println("Data sent successfully!");
      success = true;
      blinkLED(2, 100);
    } else if (httpCode == 401) {
      clearApiKey();
      registerPump();
      break;
    } else {
      retries++;
      if (retries < MAX_API_RETRIES) delay(API_RETRY_INTERVAL);
    }
  }
  
  http.end();
  return success;
}

// ============================================
// TRANSACTION FUNCTIONS
// ============================================

float getFuelPrice(const char* fuelType) {
  if (strcmp(fuelType, "PETROL") == 0) return petrolPrice;
  if (strcmp(fuelType, "DIESEL") == 0) return dieselPrice;
  return petrolPrice;
}

void completeTransaction() {
  if (!transactionActive) return;
  transactionActive = false;
  
  noInterrupts();
  unsigned long finalPulses = pulseCount;
  pulseCount = 0;
  interrupts();
  
  float finalLiters = (float)finalPulses / PULSES_PER_LITER;
  float currentPrice = getFuelPrice(currentFuelType.c_str());
  float finalAmount = finalLiters * currentPrice;
  
  if (finalLiters < 0.1) {
    Serial.println("Transaction too small, ignoring");
    return;
  }
  
  Serial.println();
  Serial.println("========================================");
  Serial.println("   TRANSACTION COMPLETE");
  Serial.println("========================================");
  Serial.printf("Liters: %.2f L\n", finalLiters);
  Serial.printf("Fuel: %s @ Rs%.0f/L\n", currentFuelType.c_str(), currentPrice);
  Serial.printf("Amount: Rs %.0f\n", finalAmount);
  Serial.printf("Nozzle: %d\n", currentNozzle);
  Serial.println("========================================");
  
  bool sent = sendPumpData(finalLiters, finalAmount, currentNozzle, currentFuelType.c_str());
  if (!sent) blinkLED(10, 50);
  
  digitalWrite(STATUS_LED_PIN, HIGH);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

void blinkLED(int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(STATUS_LED_PIN, LOW);
    delay(delayMs);
    digitalWrite(STATUS_LED_PIN, HIGH);
    delay(delayMs);
  }
}

String getISOTimestamp() {
  unsigned long uptime = millis() / 1000;
  char timestamp[30];
  snprintf(timestamp, sizeof(timestamp), "2026-03-09T%02lu:%02lu:%02luZ",
           (uptime / 3600) % 24, (uptime / 60) % 60, uptime % 60);
  return String(timestamp);
}

void simulateTransaction(float liters, int nozzle, const char* fuelType) {
  float currentPrice = getFuelPrice(fuelType);
  float amount = liters * currentPrice;
  
  Serial.println("=== TEST TRANSACTION ===");
  Serial.printf("Liters: %.2f, Fuel: %s, Price: Rs%.0f, Amount: Rs%.0f\n",
                liters, fuelType, currentPrice, amount);
  
  sendPumpData(liters, amount, nozzle, fuelType);
}
