#include "esp_now.h"
#include "WiFi.h"
#include <SPI.h>
#include <RH_NRF24.h>

// LED Pins
#define TRASH_SCAN_LED 15
#define WASTE_LED 33
#define RECYCLE_LED 32
#define WASTE_FULL_LED 12
#define RECYCLE_FULL_LED 13

// NRF pins
#define CE 4
#define CSN 5

RH_NRF24 nrf24(CE,CSN);

// Local variables
bool trash_present = false;
bool waste_sort_decision_full = false;
bool recycle_sort_decision_full = false;
int trash_scan_distance = 0;
int waste_distance = 0;
int recycle_distance = 0;
uint8_t sort_decision = 2;
//bool takeNewPhoto = true; //sort the trash before taking a new photo

// Communication variables
uint8_t ESP32_SENSORS_ADDRESS[] = {0xB0, 0xA7, 0x32, 0x8C, 0x66, 0x08};

typedef struct struct_receive_from_sensors_message
{
  char message[64];
  int trash_data;
  int waste_data;
  int recycle_data;
} struct_receive_from_sensors_message;

typedef struct struct_send_to_motor_message
{
  bool trash_detected; 
} struct_send_to_motor_message;

struct struct_receive_from_motor_message
{
  int sort_decision; // For motor Waste (0) and Recycle (1)
} struct_receive_from_motor_message;

// Structured data objects
struct_receive_from_sensors_message receivedSensorsData;
struct_send_to_motor_message sentMotorData;
//struct_receive_from_motor_message receivedMotorData;

// Peer info
esp_now_peer_info_t sensorsPeerInfo;
esp_now_peer_info_t motorPeerInfo;

// Callback function called when data is sent
void OnDataSent(const uint8_t * mac_addr, esp_now_send_status_t status)
{
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
}

// Callback function called when data is received
void OnDataRecv(const uint8_t * mac_addr, const uint8_t *incomingData, int len)
{
  switch ((uint8_t)mac_addr[5])
  {
    // Data received from Camera ESP32
    case 0x5C:
      break;
    // Data received from Motor ESP32
    case 0x4C:
      //memcpy(&receivedMotorData, incomingData, sizeof(receivedMotorData));
      //sort_decision = receivedMotorData.sort_decision;
      //Serial.print("Sort Decision: ");
      //Serial.println(sort_decision);
      break;
    case 0x08:
      memcpy(&receivedSensorsData, incomingData, sizeof(receivedSensorsData));
      //Serial.print("Data length received: ");
      //Serial.println(len);
      trash_scan_distance = receivedSensorsData.trash_data;
      //Serial.print("Trash Distance: ");
      //Serial.println(trash_scan_distance);
      waste_distance = receivedSensorsData.waste_data;
      //Serial.print("Waste Distance: ");
      //Serial.println(waste_distance);
      recycle_distance = receivedSensorsData.recycle_data;
      //Serial.print("Recycle Distance: ");
      //Serial.println(recycle_distance);
      //Serial.println();
      break;
    default:
      // Unknown MAC address
      //Serial.println("Received data from unknown MAC address");
      break;
  }
}

void setup() 
{
  // Initialize serial and wait for port to open
  Serial.begin(9600);
  delay(1500);

  WiFi.mode(WIFI_STA); // Set ESP32 as a Wifi station

  // Initialize ESP-NOW
  if(esp_now_init() != ESP_OK)
  {
    Serial.println("Error initializing ESP-NOW");
  }

  esp_now_register_send_cb(OnDataSent); // Register the send callback
  esp_now_register_recv_cb(OnDataRecv); // Register the recv callback

  // Register sensors peer
  memcpy(sensorsPeerInfo.peer_addr, ESP32_SENSORS_ADDRESS, 6);
  sensorsPeerInfo.channel = 0;
  sensorsPeerInfo.encrypt = false;

  // Add peers
  if(esp_now_add_peer(&sensorsPeerInfo) != ESP_OK)
  {
    Serial.println("Failed to add sensors peer");
  }
  if(esp_now_add_peer(&motorPeerInfo) != ESP_OK)
  {
    Serial.println("Failed to add motor peer");
  }

  // Set LED pin modes
  pinMode(TRASH_SCAN_LED, OUTPUT);
  pinMode(WASTE_LED, OUTPUT);
  pinMode(RECYCLE_LED, OUTPUT);
  pinMode(WASTE_FULL_LED, OUTPUT);
  pinMode(RECYCLE_FULL_LED, OUTPUT);

  // Ultrasonic sensor macros
  #define TRIGGER_DISTANCE 12 // trigger distance in inches

  // Turn off all LEDs
  digitalWrite(TRASH_SCAN_LED, LOW);
  digitalWrite(WASTE_LED, LOW);
  digitalWrite(RECYCLE_LED, LOW);
  digitalWrite(WASTE_FULL_LED, LOW);
  digitalWrite(RECYCLE_FULL_LED, LOW);

  if (!nrf24.init())
    Serial.println("init failed");
  // Defaults after init are 2.402 GHz (channel 5), 2Mbps, 0dBm
  if (!nrf24.setChannel(5))
    Serial.println("setChannel failed");
  if (!nrf24.setRF(RH_NRF24::DataRate2Mbps, RH_NRF24::TransmitPower0dBm))
    Serial.println("setRF failed");
}

void loop() 
{
  // Todo: Get trash scan Ultra Sonic Sensor distance value from other ESP

  if(trash_scan_distance > 0 && trash_scan_distance <= TRIGGER_DISTANCE) 
  {
    trash_present = true;
  } 
  else
  {
    trash_present = false;
  }

  // Check if trash is present 
  if(trash_present)
  {
  
    // Send data to camera/indicate for the user
    Serial.println("Sending indicator to Camera to take the photo");
    digitalWrite(TRASH_SCAN_LED, HIGH); // Turn on White LED
    delay(15000); // Delay 5 seconds
    digitalWrite(TRASH_SCAN_LED, LOW); // Turn off White LED
    //takeNewPhoto = false

    // Send data to motor
    //bool ready_to_sort = true;
    uint8_t ready_to_sort = 1;
    nrf24.send((uint8_t *) &ready_to_sort, sizeof(ready_to_sort));

     // Now wait for a reply
    nrf24.waitPacketSent();
    uint8_t buf[RH_NRF24_MAX_MESSAGE_LEN];
    uint8_t len = sizeof(buf);

    if (nrf24.waitAvailableTimeout(10000))
    { 
      // Should be a reply message for us now   
      if (nrf24.recv(buf, &len))
      {
        Serial.println("got reply!");
        sort_decision = 2;
        Serial.print("Before: ");
        Serial.println(sort_decision);
        memcpy(&sort_decision, buf, sizeof(sort_decision));
        Serial.print("After: ");
        Serial.println(sort_decision);
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

    // Todo: let camera know its ready to take a picture

    // Todo: let ML model decide where to sort trash

    // If the trash is to be sorted in the waste bin, turn on the green LED
    if (sort_decision == 0) 
    {
      digitalWrite(WASTE_LED, HIGH);
      // Todo: wait for conveyor belt to move trash into sort_decision
      delay(5000); // delay 5 seconds
      digitalWrite(WASTE_LED, LOW);
      //takeNewPhoto = true;
    }

    if(sort_decision == 1)
    {
      // If the trash is to be sorted in the recycle bin, turn on the blue LED
      digitalWrite(RECYCLE_LED, HIGH);
      // Todo: wait for conveyor belt to move trash into sort_decision
      delay(5000); // delay 5 seconds
      digitalWrite(RECYCLE_LED, LOW);
      //takeNewPhoto = true;
    }
  }

  // Todo: Get waste Ultra Sonic Sensor distance value from other ESP

  if(waste_distance > 0 && waste_distance <= TRIGGER_DISTANCE) 
  {
    waste_sort_decision_full = true;
  } 
  else
  {
    waste_sort_decision_full = false;
  }

  // If the waste sort_decision is full, turn on the red LED
  if (waste_sort_decision_full) 
  {
    digitalWrite(WASTE_FULL_LED, HIGH);
  } 
  else 
  {
    digitalWrite(WASTE_FULL_LED, LOW);
  }

  // Todo: Get recycle Ultra Sonic Sensor distance value from other ESP

  if(recycle_distance > 0 && recycle_distance <= TRIGGER_DISTANCE) 
  {
    recycle_sort_decision_full = true;
  } 
  else
  {
    recycle_sort_decision_full = false;
  }

  // If the recycle sort_decision is full, turn on the red LED
  if (recycle_sort_decision_full) 
  {
    digitalWrite(RECYCLE_FULL_LED, HIGH);
  } 
  else 
  {
    digitalWrite(RECYCLE_FULL_LED, LOW);
  }
}
