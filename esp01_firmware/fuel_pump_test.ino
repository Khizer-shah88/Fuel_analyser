/*
 * ESP-01 Fuel Pump - TEST VERSION
 * ================================
 * 
 * Test version to verify backend connectivity without flow sensor hardware.
 * 
 * PRICE SOURCE: Physical pump control panel
 * Send price updates via Serial to simulate the pump controller.
 * 
 * Commands (type in Serial Monitor at 9600 baud):
 * - P:290        → Set PETROL price to Rs290
 * - D:295        → Set DIESEL price to Rs295
 * - PRICE:290:295 → Set both prices
 * - N:1 or N:2   → Set nozzle
 * - F:PETROL     → Set fuel type
 * - F:DIESEL     → Set fuel type
 * - STATUS       → Show current status
 * - TEST         → Send test transaction
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <EEPROM.h>

// ============================================
// CONFIGURATION
// ============================================

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

const char* SERVER_HOST = "192.168.100.20";
const int SERVER_PORT = 3000;
const char* API_BASE_URL = "/api/pumps";

const char* PUMP_ID = "PUMP001";
const char* STATION_ID = "";

const float DEFAULT_PETROL_PRICE = 290.0;
const float DEFAULT_DIESEL_PRICE = 295.0;

#define EEPROM_SIZE 512
#define API_KEY_ADDR 0
#define API_KEY_LENGTH 64
#define PETROL_PRICE_ADDR 70
#define DIESEL_PRICE_ADDR 75
#define STATUS_LED_PIN 2

WiFiClient wifiClient;
char apiKey[API_KEY_LENGTH + 1] = "";
bool isRegistered = false;

// Fuel prices (from pump controller)
float petrolPrice = DEFAULT_PETROL_PRICE;
float dieselPrice = DEFAULT_DIESEL_PRICE;

int currentNozzle = 1;
String currentFuelType = "PETROL";
String serialBuffer = "";

// ============================================
// SETUP
// ============================================

void setup() {
  Serial.begin(9600);
  delay(100);
  
  Serial.println("\n========================================");
  Serial.println("   ESP-01 Fuel Pump - TEST MODE");
  Serial.println("   Price from Pump Controller");
  Serial.println("========================================");
  Serial.printf("Pump ID: %s\n", PUMP_ID);
  
  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, HIGH);
  
  EEPROM.begin(EEPROM_SIZE);
  loadApiKey();
  loadFuelPrices();
  
  connectToWiFi();
  if (WiFi.status() == WL_CONNECTED) registerPump();
  
  printHelp();
}

void loop() {
  handleSerialInput();
  yield();
  delay(10);
}

// ============================================
// SERIAL INPUT HANDLER
// ============================================

void handleSerialInput() {
  while (Serial.available()) {
    char c = Serial.read();
    
    if (c == '\n' || c == '\r') {
      if (serialBuffer.length() > 0) {
        processCommand(serialBuffer);
        serialBuffer = "";
      }
    } else {
      serialBuffer += c;
      if (serialBuffer.length() > 50) serialBuffer = "";
    }
  }
}

void processCommand(String cmd) {
  cmd.trim();
  String upperCmd = cmd;
  upperCmd.toUpperCase();
  
  Serial.printf("\n>>> %s\n", cmd.c_str());
  
  // Set PETROL price
  if (upperCmd.startsWith("P:")) {
    float newPrice = cmd.substring(2).toFloat();
    if (newPrice > 0 && newPrice < 10000) {
      Serial.printf("PETROL: Rs%.0f -> Rs%.0f\n", petrolPrice, newPrice);
      petrolPrice = newPrice;
      saveFuelPrices();
      blinkLED(2, 100);
    }
  }
  // Set DIESEL price
  else if (upperCmd.startsWith("D:")) {
    float newPrice = cmd.substring(2).toFloat();
    if (newPrice > 0 && newPrice < 10000) {
      Serial.printf("DIESEL: Rs%.0f -> Rs%.0f\n", dieselPrice, newPrice);
      dieselPrice = newPrice;
      saveFuelPrices();
      blinkLED(2, 100);
    }
  }
  // Set both prices
  else if (upperCmd.startsWith("PRICE:")) {
    String prices = cmd.substring(6);
    int pos = prices.indexOf(':');
    if (pos > 0) {
      petrolPrice = prices.substring(0, pos).toFloat();
      dieselPrice = prices.substring(pos + 1).toFloat();
      Serial.printf("Prices set: PETROL=Rs%.0f, DIESEL=Rs%.0f\n", petrolPrice, dieselPrice);
      saveFuelPrices();
      blinkLED(2, 100);
    }
  }
  // Set nozzle
  else if (upperCmd.startsWith("N:")) {
    int n = cmd.substring(2).toInt();
    if (n >= 1 && n <= 10) {
      currentNozzle = n;
      Serial.printf("Nozzle: %d\n", currentNozzle);
    }
  }
  // Set fuel type
  else if (upperCmd.startsWith("F:")) {
    String ft = upperCmd.substring(2);
    ft.trim();
    if (ft == "PETROL" || ft == "DIESEL") {
      currentFuelType = ft;
      Serial.printf("Fuel type: %s\n", currentFuelType.c_str());
    }
  }
  // Status
  else if (upperCmd == "STATUS") {
    printStatus();
  }
  // Test transaction
  else if (upperCmd == "TEST") {
    sendTestTransaction(5.5);
  }
  // Custom test: TEST:10.5
  else if (upperCmd.startsWith("TEST:")) {
    float liters = cmd.substring(5).toFloat();
    if (liters > 0) sendTestTransaction(liters);
  }
  // Help
  else if (upperCmd == "HELP") {
    printHelp();
  }
  // Register
  else if (upperCmd == "REGISTER") {
    clearApiKey();
    registerPump();
  }
  else {
    Serial.println("Unknown command. Type HELP for commands.");
  }
  Serial.println();
}

void printHelp() {
  Serial.println("\n========================================");
  Serial.println("   COMMANDS (type in Serial Monitor)");
  Serial.println("========================================");
  Serial.println("P:290       - Set PETROL price to 290");
  Serial.println("D:295       - Set DIESEL price to 295");
  Serial.println("PRICE:290:295 - Set both prices");
  Serial.println("N:1         - Set nozzle (1-10)");
  Serial.println("F:PETROL    - Set fuel type");
  Serial.println("F:DIESEL    - Set fuel type");
  Serial.println("STATUS      - Show current status");
  Serial.println("TEST        - Send 5.5L test transaction");
  Serial.println("TEST:10.5   - Send custom liters");
  Serial.println("REGISTER    - Re-register pump");
  Serial.println("HELP        - Show this help");
  Serial.println("========================================");
  Serial.printf("Current: PETROL=Rs%.0f, DIESEL=Rs%.0f\n", petrolPrice, dieselPrice);
}

void printStatus() {
  Serial.println("========================================");
  Serial.println("   PUMP STATUS");
  Serial.println("========================================");
  Serial.printf("WiFi: %s\n", WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
  Serial.printf("IP: %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("Server: %s:%d\n", SERVER_HOST, SERVER_PORT);
  Serial.printf("Pump ID: %s\n", PUMP_ID);
  Serial.printf("Registered: %s\n", isRegistered ? "Yes" : "No");
  Serial.println("--- FUEL PRICES (from pump panel) ---");
  Serial.printf("PETROL: Rs %.0f/L\n", petrolPrice);
  Serial.printf("DIESEL: Rs %.0f/L\n", dieselPrice);
  Serial.printf("Current Nozzle: %d\n", currentNozzle);
  Serial.printf("Current Fuel: %s\n", currentFuelType.c_str());
  Serial.println("========================================");
}

// ============================================
// TEST TRANSACTION
// ============================================

void sendTestTransaction(float liters) {
  float price = (currentFuelType == "DIESEL") ? dieselPrice : petrolPrice;
  float amount = liters * price;
  
  Serial.println("========================================");
  Serial.println("   SENDING TRANSACTION");
  Serial.println("========================================");
  Serial.printf("Liters: %.2f L\n", liters);
  Serial.printf("Fuel: %s @ Rs%.0f/L (from pump panel)\n", currentFuelType.c_str(), price);
  Serial.printf("Amount: Rs %.0f\n", amount);
  Serial.printf("Nozzle: %d\n", currentNozzle);
  Serial.println("========================================");
  
  bool success = sendPumpData(liters, amount, currentNozzle, currentFuelType.c_str());
  Serial.printf("Result: %s\n", success ? "SUCCESS" : "FAILED");
  if (success) blinkLED(2, 100);
  else blinkLED(10, 50);
}

// ============================================
// FUEL PRICE STORAGE
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
    petrolPrice = DEFAULT_PETROL_PRICE;
    dieselPrice = DEFAULT_DIESEL_PRICE;
    return;
  }
  
  int petrolInt = (EEPROM.read(PETROL_PRICE_ADDR) << 8) | EEPROM.read(PETROL_PRICE_ADDR + 1);
  if (petrolInt > 0 && petrolInt < 1000000) petrolPrice = petrolInt / 100.0;
  
  int dieselInt = (EEPROM.read(DIESEL_PRICE_ADDR) << 8) | EEPROM.read(DIESEL_PRICE_ADDR + 1);
  if (dieselInt > 0 && dieselInt < 1000000) dieselPrice = dieselInt / 100.0;
  
  Serial.printf("Loaded prices: PETROL=Rs%.0f, DIESEL=Rs%.0f\n", petrolPrice, dieselPrice);
}

// ============================================
// WIFI & API
// ============================================

void connectToWiFi() {
  Serial.printf("Connecting to WiFi: %s", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
    digitalWrite(STATUS_LED_PIN, !digitalRead(STATUS_LED_PIN));
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf(" Connected! IP: %s\n", WiFi.localIP().toString().c_str());
    digitalWrite(STATUS_LED_PIN, HIGH);
  } else {
    Serial.println(" Failed!");
  }
}

void loadApiKey() {
  for (int i = 0; i < API_KEY_LENGTH; i++) apiKey[i] = EEPROM.read(API_KEY_ADDR + i);
  apiKey[API_KEY_LENGTH] = '\0';
  
  if (strlen(apiKey) > 10 && apiKey[0] != 0xFF) {
    isRegistered = true;
  } else {
    memset(apiKey, 0, sizeof(apiKey));
    isRegistered = false;
  }
}

void saveApiKey(const char* key) {
  for (int i = 0; i < API_KEY_LENGTH; i++) {
    EEPROM.write(API_KEY_ADDR + i, i < strlen(key) ? key[i] : 0);
  }
  EEPROM.commit();
}

void clearApiKey() {
  for (int i = 0; i < API_KEY_LENGTH; i++) EEPROM.write(API_KEY_ADDR + i, 0xFF);
  EEPROM.commit();
  memset(apiKey, 0, sizeof(apiKey));
  isRegistered = false;
}

void registerPump() {
  if (WiFi.status() != WL_CONNECTED) return;
  if (isRegistered && strlen(apiKey) > 10) return;
  
  Serial.println("Registering pump...");
  
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
        const char* key = responseDoc["apiKey"];
        if (key && strlen(key) > 0) {
          strncpy(apiKey, key, API_KEY_LENGTH);
          saveApiKey(apiKey);
          isRegistered = true;
          Serial.println("Pump registered!");
          blinkLED(3, 100);
        }
      }
    }
  } else {
    Serial.printf("Registration failed: %d\n", httpCode);
  }
  http.end();
}

bool sendPumpData(float liters, float amount, int nozzle, const char* fuelType) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected");
    return false;
  }
  if (!isRegistered) {
    registerPump();
    return false;
  }
  
  HTTPClient http;
  String url = String("http://") + SERVER_HOST + ":" + SERVER_PORT + API_BASE_URL + "/data";
  
  http.begin(wifiClient, url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", apiKey);
  http.setTimeout(10000);
  
  unsigned long uptime = millis() / 1000;
  char timestamp[30];
  snprintf(timestamp, sizeof(timestamp), "2026-03-09T%02lu:%02lu:%02luZ",
           (uptime / 3600) % 24, (uptime / 60) % 60, uptime % 60);
  
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
  Serial.printf("Payload: %s\n", payload.c_str());
  
  int httpCode = http.POST(payload);
  bool success = (httpCode == 200 || httpCode == 201);
  
  Serial.printf("HTTP: %d - %s\n", httpCode, success ? "OK" : "FAILED");
  
  http.end();
  return success;
}

void blinkLED(int times, int ms) {
  for (int i = 0; i < times; i++) {
    digitalWrite(STATUS_LED_PIN, LOW);
    delay(ms);
    digitalWrite(STATUS_LED_PIN, HIGH);
    delay(ms);
  }
}
