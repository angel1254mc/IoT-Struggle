#include "esp_now.h"
#include "WiFi.h"

// LED Pins
#define TRASH_SCAN_LED 15
#define WASTE_LED 33
#define RECYCLE_LED 32
#define WASTE_FULL_LED 12
#define RECYCLE_FULL_LED 14

// Local variables
bool trash_present = false;
bool waste_bin_full = false;
bool recycle_bin_full = false;
int trash_scan_distance = 0;
int waste_distance = 0;
int recycle_distance = 0;

// Communication variables
uint8_t ESP32_CAMERA_BROADCAST_ADDRESS[] = {0xA0, 0xB7, 0x65, 0xFE, 0xDB, 0x5C};
uint8_t ESP32_MOTOR_BROADCAST_ADDRESS[] = {};
uint8_t ESP32_SENSORS_BROADCAST_ADDRESS[] = {0xB0, 0xA7, 0x32, 0x8C, 0x66, 0x08};

// Communication data structures
/*typedef struct struct_send_to_camera_message
{
  bool ready_to_take_picture; // For camera
  //int sort_decision; // For motor Waste (0) and Recycle (1)
} struct_send_to_camera_message;
*/
typedef struct struct_receive_from_sensors
{
  char message[64];
  int trash_data;
  int waste_data;
  int recycle_data;
} struct_receive_from_sensors;

// Structured data objects
//struct_send_to_camera_message broadcastCameraData;
struct_receive_from_sensors receivedSensorsData;

// Peer info
//esp_now_peer_info_t cameraPeerInfo;
//esp_now_peer_info_t sensorsPeerInfo;

// Callback function called when data is sent
/*void OnDataSent(const uint8_t * mac_addr, esp_now_send_status_t status)
{
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
}
*/
// Callback function called when data is received
void OnDataRecv(const uint8_t * mac_addr, const uint8_t *incomingData, int len)
{
  memcpy(&receivedSensorsData, incomingData, sizeof(receivedSensorsData));
  Serial.print("Data length received: ");
  Serial.println(len);
  trash_scan_distance = receivedSensorsData.trash_data;
  Serial.print("Trash Distance: ");
  Serial.println(trash_scan_distance);
  waste_distance = receivedSensorsData.waste_data;
  Serial.print("Waste Distance: ");
  Serial.println(waste_distance);
  recycle_distance = receivedSensorsData.recycle_data;
  Serial.print("Recycle Distance: ");
  Serial.println(recycle_distance);
  Serial.println();
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

  //esp_now_register_send_cb(OnDataSent); // Register the send callback
  esp_now_register_recv_cb(OnDataRecv); // Register the recv callback

  // Register camera peer
  /*memcpy(cameraPeerInfo.peer_addr, ESP32_CAMERA_BROADCAST_ADDRESS, 6);
  cameraPeerInfo.channel = 0;
  cameraPeerInfo.encrypt = false;

  // Register sensors peer
  memcpy(sensorsPeerInfo.peer_addr, ESP32_SENSORS_BROADCAST_ADDRESS, 6);
  sensorsPeerInfo.channel = 0;
  sensorsPeerInfo.encrypt = false;

  // Add peers
  if(esp_now_add_peer(&cameraPeerInfo) != ESP_OK)
  {
    Serial.println("Failed to add camera peer");
  }
  if(esp_now_add_peer(&sensorsPeerInfo) != ESP_OK)
  {
    Serial.println("Failed to add sensors peer");
  }
  */

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
    /*broadcastCameraData.ready_to_take_picture = true; // Format structured broadcast data
    esp_err_t result = esp_now_send(ESP32_CAMERA_BROADCAST_ADDRESS, (uint8_t *) &broadcastCameraData, sizeof(broadcastCameraData));

    if(result == ESP_OK)
    {
      Serial.println("Sending confirmed");
    }
    else
    {
      Serial.println("Sending error");
    }
    */
    digitalWrite(TRASH_SCAN_LED, HIGH); // Turn on White LED
    delay(5000); // Delay 5 seconds
    digitalWrite(TRASH_SCAN_LED, LOW); // Turn off White LED

    // Todo: let camera know its ready to take a picture

    // Todo: let ML model decide where to sort trash

    int bin = random() % 2;; // Waste (0) and Recycle (1)

    Serial.println();

    // If the trash is to be sorted in the waste bin, turn on the green LED
    if (bin == 0) 
    {
      digitalWrite(WASTE_LED, HIGH);
      // Todo: wait for conveyor belt to move trash into bin
      delay(5000); // delay 5 seconds
      digitalWrite(WASTE_LED, LOW);
    }

    if(bin == 1)
    {
      // If the trash is to be sorted in the recycle bin, turn on the blue LED
      digitalWrite(RECYCLE_LED, HIGH);
      // Todo: wait for conveyor belt to move trash into bin
      delay(5000); // delay 5 seconds
      digitalWrite(RECYCLE_LED, LOW);
    }
  }

  // Todo: Get waste Ultra Sonic Sensor distance value from other ESP

  if(waste_distance > 0 && waste_distance <= TRIGGER_DISTANCE) 
  {
    waste_bin_full = true;
  } 
  else
  {
    waste_bin_full = false;
  }

  // If the waste bin is full, turn on the red LED
  if (waste_bin_full) 
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
    recycle_bin_full = true;
  } 
  else
  {
    recycle_bin_full = false;
  }

  // If the recycle bin is full, turn on the red LED
  if (recycle_bin_full) 
  {
    digitalWrite(RECYCLE_FULL_LED, HIGH);
  } 
  else 
  {
    digitalWrite(RECYCLE_FULL_LED, LOW);
  }
}