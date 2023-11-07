#include <Stepper.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <Firebase_ESP_Client.h>
#include "soc/soc.h"           // Disable brownout problems
#include "soc/rtc_cntl_reg.h"  // Disable brownout problems
#include "driver/rtc_io.h"
#include <LittleFS.h>
#include <FS.h>
#include "Arduino.h"
#include <SPIFFS.h>
#include <esp_now.h>

#include "esp_camera.h"
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h> //token generation

// -[ Wrover Pins ]
#define PWDN_GPIO_NUM    -1
#define RESET_GPIO_NUM   -1
#define XCLK_GPIO_NUM    21
#define SIOD_GPIO_NUM    26
#define SIOC_GPIO_NUM    27
#define Y9_GPIO_NUM      35
#define Y8_GPIO_NUM      34
#define Y7_GPIO_NUM      39
#define Y6_GPIO_NUM      36
#define Y5_GPIO_NUM      19
#define Y4_GPIO_NUM      18
#define Y3_GPIO_NUM       5
#define Y2_GPIO_NUM       4
#define VSYNC_GPIO_NUM   25
#define HREF_GPIO_NUM    23
#define PCLK_GPIO_NUM    22
#define FORMAT_LITTLEFS_IF_FAILED true
#define FILE_PHOTO_PATH "/photo.jpg"
#define BUCKET_PHOTO "/data/photo.jpg"
#define STORAGE_BUCKET_ID "fullstack-iot-web.appspot.com"
#define API_KEY "AIzaSyCSNAmeTSQVZPP6JzkiJvTQrsd1MJafkTw"

String serverName = "http://127.20.10.3:3001/api/recognize";

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig configF;

uint8_t LEDControllerAddress[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};
uint8_t SensorControllerAddress[] = {0xFA, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};
// Data structure of data to send to responder
typedef struct Message
{
  char message[64];
  int trash_data;
  int waste_data;
  int recycle_data;
} Message;

Message outgoingData;
Message incomingData;

// Peers Data Structure
esp_now_peer_info_t peerInfoLED;
esp_now_peer_info_t peerInfoSensor;

// HttpClient for server
HTTPClient http;

// ============= CAMERA CODE =============== // 

void initLittleFS(){
  if (!LittleFS.begin(true)) {
    Serial.println("An Error has occurred while mounting LittleFS");
    ESP.restart();
  }
  else {
    delay(500);
    Serial.println("LittleFS mounted successfully");
  }
}

//initializes camera
void initCamera(){
 // modified for Wrover Module
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode = CAMERA_GRAB_LATEST;

  if (psramFound()) {
    config.frame_size = FRAMESIZE_UXGA;
    config.jpeg_quality = 10;
    config.fb_count = 1;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }
  // Camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    ESP.restart();
  } 
}

void capturePhotoSaveLittleFS( void ) {
  // Dispose first pictures because of bad quality
  camera_fb_t* fb = NULL;
  // Skip first 3 frames (increase/decrease number as needed).
  for (int i = 0; i < 4; i++) {
    fb = esp_camera_fb_get();
    esp_camera_fb_return(fb);
    fb = NULL;
  }
    
  // Take a new photo
  fb = NULL;  
  fb = esp_camera_fb_get();  
  if(!fb) {
    Serial.println("Camera capture failed");
    delay(1000);
    ESP.restart();
  }  

  // Photo file name
  Serial.printf("Picture file name: %s\n", FILE_PHOTO_PATH);
  File file = LittleFS.open(FILE_PHOTO_PATH, FILE_WRITE);

  // Insert the data in the photo file
  if (!file) {
    Serial.println("Failed to open file in writing mode");
  }
  else {
    file.write(fb->buf, fb->len); // payload (image), payload length
    Serial.print("The picture has been saved in ");
    Serial.print(FILE_PHOTO_PATH);
    Serial.print(" - Size: ");
    Serial.print(fb->len);
    Serial.println(" bytes");
  }
  // Close the file
  file.close();
  esp_camera_fb_return(fb);
}
void fcsUploadCallback(FCS_UploadStatusInfo info) {
   if (info.status == firebase_fcs_upload_status_init){
        Serial.printf("Uploading file %s (%d) to %s\n", info.localFileName.c_str(), info.fileSize, info.remoteFileName.c_str());
    }
    else if (info.status == firebase_fcs_upload_status_upload)
    {
        Serial.printf("Uploaded %d%s, Elapsed time %d ms\n", (int)info.progress, "%", info.elapsedTime);
    }
    else if (info.status == firebase_fcs_upload_status_complete)
    {
      Serial.println("Successfully Completed Upload!");
    }
    else if (info.status == firebase_fcs_upload_status_error){
        Serial.printf("Upload failed, %s\n", info.errorMsg.c_str());
    }
}

int uploadImage() {
  if (Firebase.ready()){
    Serial.print("Uploading picture... ");

    //MIME type should be valid to avoid the download problem.
    //The file systems for flash and SD/SDMMC can be changed in FirebaseFS.h.
    if (Firebase.Storage.upload(&fbdo, STORAGE_BUCKET_ID /* Firebase Storage bucket id */, FILE_PHOTO_PATH /* path to local file */, mem_storage_type_flash /* memory storage type, mem_storage_type_flash and mem_storage_type_sd */, BUCKET_PHOTO /* path of remote file stored in the bucket */, "image/jpeg" /* mime type */,fcsUploadCallback)){
      Serial.printf("\nDownload URL: %s\n", fbdo.downloadURL().c_str());
      return 1;
    }
    else{
      Serial.println(fbdo.errorReason());
      return -1;
    }
  }
}

void getPrediction() {
  // Now we have to use the HTTP Client to ping the backend (whichever one we choose);
  int httpCode = http.GET();

  if(httpCode > 0 && httpCode == HTTP_CODE_OK) {
      // Server returns JSON response
      String payload = http.getString();
      Serial.println(payload);
  } else {
      Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
  }
  http.end();

}


// ======================== NON-CAMERA CODE ============================= //

// Callback function for data sent
void OnDataSent(const uint8_t* MAC_ADDRESS, esp_now_send_status_t status)
{
  if (status == ESP_NOW_SEND_SUCCESS)
  {
    Serial.println("Data was sent successfully!");
  }
  else
  {
    Serial.println("Error in sending data.");
  }
}

void OnDataRecv(const uint8_t * mac, const uint8_t *received, int len) {
  memcpy(&incomingData, received, sizeof(incomingData));
  // Now check to see what type of messge this was
  String message(incomingData.message);
  // if LED Controller tells us an object was detected
  if (memcmp(mac, LEDControllerAddress, 6) && message.indexOf("Detected")) {
    // Launch the camera and take a picture
    delay(2000); // Give user 2 seconds to take their hand away
    capturePhotoSaveLittleFS();
    // Send data to Firebase
    if(uploadImage() == -1) // check for error
      return;
    // Ping backend server
    getPrediction();
    // Wait for response
    // 
  }

}
 


// WiFi Configuration

#define ssid "Angel’s iPhone"
#define password "YesAngel"

// General Setup
void setup() {
  Serial.begin(9600);
  // Start WiFi
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");  
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  // Start HTTP Client
  http.begin(serverName); //HTTP

  // Start ESP Now

  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }

  // Register "data sent" callback
  esp_now_register_send_cb(OnDataSent);

  // Register Peers
  // Peer 1 - LED Controller
  memcpy(peerInfoLED.peer_addr, LEDControllerAddress, 6);
  peerInfoLED.channel = 0;  
  peerInfoLED.encrypt = false;

  // Peer 2 - Sensor Controller
  memcpy(peerInfoSensor.peer_addr, SensorControllerAddress, 6);
  peerInfoSensor.channel = 0;  
  peerInfoSensor.encrypt = false;

  if (esp_now_add_peer(&peerInfoLED) != ESP_OK){
    Serial.println("Failed to add LED Controller Peer");
    return;
  }

  if (esp_now_add_peer(&peerInfoSensor) != ESP_OK){
    Serial.println("Failed to add Sensor Controller Peer");
    return;
  }

  // Register "data received" callback
  esp_now_register_recv_cb(OnDataRecv);

  // Now Initialize Camera and Firebase
  initLittleFS();
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
  initCamera();

  // Populate FirebaseConfig and Signin
  configF.api_key = API_KEY;
  if(Firebase.signUp(&configF, &auth, "", "")){
    Serial.println("SignUp ok!");
    configF.token_status_callback = tokenStatusCallback;
    Firebase.begin(&configF, &auth);
    Firebase.reconnectWiFi(true);
  }
  else{
    Serial.printf("%s\n", configF.signer.signupError.message.c_str());
  }

  // By now we've initialized LittleFS, Camera, Firebase, ESP-NOW, 
  // All remaining logic should be handled in the callbacks

}

void loop() {

  // This is all test code to verify that this works
  delay(4000);
  HTTPClient http;
  http.begin(serverName); //HTTP
  int httpCode = http.GET();
  if(httpCode == HTTP_CODE_OK) {
      String payload = http.getString();
      Serial.println(payload);
  }
  Serial.print("Bad Code: ");
  Serial.print(httpCode);
  Serial.println("");
  
}