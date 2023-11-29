#include <Stepper.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <RH_NRF24.h>
#include <ESP32Servo.h>
#define CE 4
#define CSN 5

//uint8_t LEDControllerAddress[] = {0xA0,0xB7,0x65,0xFE,0x72,0xD4};

#define ssid "Angel’s iPhone"
#define password "YesAngel"

HTTPClient http;
String serverName = "http://172.20.10.3:3001/api/recognize";

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

#define ssid "Angel’s iPhone"
#define password "YesAngel"

RH_NRF24 nrf24(CE,CSN);


struct ToLEDMessage { // To Alejandro's ESP
  int sort_decision; 
} outgoingData;

struct FromLEDMessage { // From Alejandro's ESP
  bool trash_detected; 
} incomingData;


void setup() {
  // initialize the serial port
  Serial.begin(9600);

  if (!nrf24.init())
    Serial.println("init failed");
  // Defaults after init are 2.402 GHz (channel 2), 2Mbps, 0dBm
  if (!nrf24.setChannel(1))
    Serial.println("setChannel failed");
  if (!nrf24.setRF(RH_NRF24::DataRate2Mbps, RH_NRF24::TransmitPower0dBm))
    Serial.println("setRF failed");    

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  Serial.println("Connected WiFi");

  Serial.println("WiFi connected");  
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  http.setTimeout(10);
  //initESPNow();
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
      memcpy(&incomingData, buf, sizeof(incomingData));
      Serial.print("Received Trash is: ");
      if (incomingData.trash_detected) {
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
    Serial.println("No reply, is nrf24_server running?");
  }

  if (incomingData.trash_detected) {

    http.begin(serverName); //HTTP
    int httpCode = http.GET();
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
            int pos;
            for (pos = 0; pos < 1000; pos++) {
              myservo.write(0);
              delay(13); //random choice of delay 💀
            }
            myservo.write(90);
        } else {
            recycle = true;
           
            int pos;
            for (pos = 0; pos < 1000; pos++) {
              myservo.write(180);
              delay(13); //random choice of delay 💀
            }
            myservo.write(90);
        }
        // Send the prediction result to the sensor LED
        Serial.println("Send data back to Alejandro Here");
        if (recycle) {
          uint8_t data[] = "1";
          nrf24.send(data, sizeof(data));
        } else {
          uint8_t data[] = "0";
          nrf24.send(data, sizeof(data));
        }
        // Reset incomingData to wait for the next time we detect trash.
    } else {
        uint8_t data[] = "1";
        Serial.println("Sent data to Alejandro");
        nrf24.send(data, sizeof(data));
        Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
        delay(200);
    }
    http.end();
    incomingData.trash_detected = false;
  }
}