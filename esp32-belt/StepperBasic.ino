#include <Stepper.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <RH_NRF24.h>
#include <ESP32Servo.h>
#include "esp32-hal-log.h"
#define CE 4
#define CSN 5
uint8_t receivedData = 0;
uint8_t sendData = 0;

#if (!PLATFORMIO)
  // Enable Arduino-ESP32 logging in Arduino IDE
  #ifdef CORE_DEBUG_LEVEL
    #undef CORE_DEBUG_LEVEL
  #endif
  #ifdef LOG_LOCAL_LEVEL
    #undef LOG_LOCAL_LEVEL
  #endif

  #define CORE_DEBUG_LEVEL 4
  #define LOG_LOCAL_LEVEL CORE_DEBUG_LEVEL
#endif  

//uint8_t LEDControllerAddress[] = {0xA0,0xB7,0x65,0xFE,0x72,0xD4};

#define ssid "ufdevice"
#define password "gogators"

HTTPClient http;
String serverName = "100.110.174.73";


Servo myservo;  // create servo object to control a servo


// ULN2003 Motor Driver Pins
//#define IN1 32
//#define IN2 33
//#define IN3 25
//#define IN4 26
//#define LED_PIN 14
// initialize the stepper library

//#define stepsPerRevolution 2048  // change this to fit the number of steps per revolution
//Stepper myStepper(stepsPerRevolution, IN1, IN2, IN3, IN4);

RH_NRF24 nrf24(CE,CSN);


struct ToLEDMessage { // To Alejandro's ESP
  int sort_decision; 
} outgoingData;

struct FromLEDMessage { // From Alejandro's ESP
  bool trash_detected; 
} incomingData;



void setup() {
  // initialize the serial port
  WiFi.disconnect();
  Serial.begin(9600);
  esp_log_level_set("*", ESP_LOG_DEBUG);
  if (!nrf24.init())
    Serial.println("init failed");
  // Defaults after init are 2.402 GHz (channel 2), 2Mbps, 0dBm
  if (!nrf24.setChannel(5))
    Serial.println("setChannel failed");
  if (!nrf24.setRF(RH_NRF24::DataRate2Mbps, RH_NRF24::TransmitPower0dBm))
    Serial.println("setRF failed");    

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  Serial.println("Connected WiFi");

  Serial.println("WiFi connected");  
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  http.setTimeout(100);
  http.begin(serverName.c_str(), 3001, "/api/recognize");
  Serial.println("We made it guys!");
}

void loop() {

  uint8_t buf[RH_NRF24_MAX_MESSAGE_LEN];
  uint8_t len = sizeof(buf);
  if (nrf24.waitAvailableTimeout(500))
  { 
    // Should be a reply message for us now   
    if (nrf24.recv(buf, &len))
    {
      memcpy(&receivedData, buf, sizeof(receivedData));
      Serial.print("Received Trash is: ");
      if (receivedData == 1) {
        Serial.print("detected!\n");
      } else {
        Serial.print("not detected!\n");
      }
    }
    else
    {
      Serial.println("recv failed");
    }
  }
  else
  {
    //Serial.println("No reply, is nrf24_server running?");
  }

  if (receivedData == 1) {
    delay(1000);
    // presumably http is already started
    int httpCode = http.GET();
    while (httpCode <= 0) {
      Serial.print("Got HTTP Code: ");
      Serial.print(httpCode);
      Serial.print("\n");
      httpCode = http.GET();
    }
    if(httpCode > 0 && httpCode == HTTP_CODE_OK) {
        // Server returns JSON response
        String payload = http.getString();
        int start = payload.indexOf("[") + 2;
        int end = payload.indexOf("]") - 1;
        // Get best match string
        String prediction = payload.substring(start, end);

        Serial.print("The Server recognized this item as: ");
        Serial.print(prediction);
        Serial.print("\n");
        bool recycle = false;
        if (prediction.equals("nonrecyclableglass") || prediction.equals("trash")) {
            recycle = false;
            sendData = 0;
            nrf24.send((uint8_t*)&sendData, sizeof(sendData));
            while (!nrf24.waitPacketSent());
            int pos;
            for (pos = 0; pos < 1000; pos++) {
              myservo.write(0);
              delay(13); //random choice of delay 💀
            }
            myservo.write(90);
        } else {
            recycle = true;
            sendData = 1;
            nrf24.send((uint8_t*)&sendData, sizeof(sendData));
            while (!nrf24.waitPacketSent());
            int pos;
            for (pos = 0; pos < 1000; pos++) {
              myservo.write(180);
              delay(13); //random choice of delay 💀
            }
            myservo.write(90);
        }
        // Send the prediction result to the sensor LED
        Serial.println("Send data back to Alejandro Here");
        // Reset incomingData to wait for the next time we detect trash.
        receivedData = 0;
    } else {
        sendData = 1;
        Serial.println("Sent data to Alejandro");
        nrf24.send((uint8_t*)&sendData, sizeof(sendData));
        while (!nrf24.waitPacketSent());
        Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
        delay(200);
        receivedData = 0;
    }
    http.end();
    incomingData.trash_detected = false;
  }
}