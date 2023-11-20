#include <Firebase_ESP_Client.h>
#include "soc/soc.h"           // Disable brownout problems
#include "soc/rtc_cntl_reg.h"  // Disable brownout problems
#include "driver/rtc_io.h"
#include <LittleFS.h>
#include <FS.h>
#include "Arduino.h"
#include "esp_camera.h"
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h> //token generation

#include "ImportantContents.h" //contains all the important bits

#include <HardwareSerial.h>

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
String BUCKET_PHOTO = "/photo.jpg";

#define indicatorLED    2

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig configF;

bool signUpOk = false;
bool takeNewPhoto = true;

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
  Serial.println("exiting capturePhotoSaveLittleFS");
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

// WiFi Configuration
void initWiFi(){
  //getting to Wifi
  WiFi.begin(AP_SSID, AP_PASS);

  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED){
    Serial.print(" .");
    delay(300);
  }

  //connected message
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("Wi-Fi Channel: ");
  Serial.println(WiFi.channel());
}

// ======================== NON-CAMERA CODE ============================= //

//For recieving the data

// ======================== SETUP AND LOOP ============================= //

// General Setup
void setup() {
  Serial.begin(115200);
  // Start WiFi
  initWiFi();

  // Now Initialize Camera and Firebase
  initLittleFS();
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
  initCamera();

  // Populate FirebaseConfig and Signin
  configF.api_key = API_KEY;

  //making sure we're signed in
  while (!signUpOk){
    if(Firebase.signUp(&configF, &auth, "", "")){
      Serial.println("SignUp ok!");
      configF.token_status_callback = tokenStatusCallback;
      signUpOk = true;
    }
    else{
      Serial.println("SignUp failed!");
      Serial.printf("%s\n", configF.signer.signupError.message.c_str());
    }
  }

  Firebase.begin(&configF, &auth);
  Firebase.reconnectWiFi(true);

  bool restartAttempt = false;

  //then, once all the connections are done...
  if (Firebase.ready() && !restartAttempt){
    String documentPath = "Mac-To-Users/" + WiFi.macAddress();
    String fieldPath = "ActiveUserID";

    FirebaseJson jsonPayload;
    FirebaseJsonData jsonData;

    //get the document associated with our mac address
    if (Firebase.Firestore.getDocument(&fbdo, "iotstruggle", "", documentPath.c_str(), fieldPath.c_str())){
      Serial.printf("ok\n%s\n\n", fbdo.payload().c_str());
      jsonPayload.setJsonData(fbdo.payload().c_str());

      // Get the data from FirebaseJson object 
      jsonPayload.get(jsonData, "fields/ActiveUserID/stringValue", true);
      Serial.println(jsonData.stringValue);
      // User ID will determine bucket name
      String uid = jsonData.stringValue;
      BUCKET_PHOTO = uid + BUCKET_PHOTO;
      restartAttempt = false;
    }
    else{
      restartAttempt = true;
    }
  }
  else{
    Serial.println(fbdo.errorReason());
    restartAttempt = true;
  }
  

  //indicator stuff
  pinMode(indicatorLED, INPUT);
  
}

void loop() {

  if (digitalRead(indicatorLED) == HIGH){
    Serial.println("Yes its being received!");
    capturePhotoSaveLittleFS();
    Serial.print("Uploading picture... ");

    while (takeNewPhoto){
      if (Firebase.ready()){
        takeNewPhoto = false;
        if (Firebase.Storage.upload(&fbdo, STORAGE_BUCKET_ID, FILE_PHOTO_PATH, mem_storage_type_flash, BUCKET_PHOTO, "image/jpeg",fcsUploadCallback)){
          Serial.printf("\nDownload URL: %s\n", fbdo.downloadURL().c_str());
        }
        else{
          Serial.println(fbdo.errorReason());
        }
      }
      else{
        Serial.println("Error with Firebase! Retrying Photo Upload!");
        Serial.println();
      }
    }
    takeNewPhoto = true;
  }
}