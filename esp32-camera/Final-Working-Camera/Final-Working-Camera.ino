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
#include <LiquidCrystal_I2C.h>
#include <Wire.h>

#include "ImportantContents.h" //contains all the important bits

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
String BUCKET_PHOTO = "";
String PhotoName = "/photo.jpg";

// #define indicatorLED    32
#define indicatorLED    2

#define SDA 13                    //Define SDA pins
#define SCL 14                    //Define SCL pins
LiquidCrystal_I2C lcd(0x27,16,2);

bool i2CAddrTest(uint8_t addr) {
  Wire.begin();
  Wire.beginTransmission(addr);
  if (Wire.endTransmission() == 0) {
    return true;
  }
  return false;
}

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig configF;

bool signUpOk = false;
bool takeNewPhoto = true;
String uid = "";
String displayName = "";
bool uidError = false;

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

void grabUserInfo(){
  //Serial.println("Start Grabbing User Info. . .");

  if (Firebase.ready()){
    //first get uid
    String documentPath = "Mac-To-Users/" + WiFi.macAddress();
    String fieldPath = "ActiveUserID";

    FirebaseJson jsonPayload;
    FirebaseJsonData jsonData;

    //get the document associated with our mac address
    if (Firebase.Firestore.getDocument(&fbdo, "iotstruggle", "", documentPath.c_str(), fieldPath.c_str())){
      //Serial.printf("ok\n%s\n\n", fbdo.payload().c_str());
      jsonPayload.setJsonData(fbdo.payload().c_str());

      // Get the data from FirebaseJson object 
      jsonPayload.get(jsonData, "fields/ActiveUserID/stringValue", true);
      //Serial.println(jsonData.stringValue);
      // User ID will determine bucket name
      String newUid = jsonData.stringValue;
      if (newUid != uid){
        uid = newUid;
        BUCKET_PHOTO = uid + PhotoName;

        //then get displayName
        documentPath = "Users/" + uid;
        fieldPath = "displayName";
        //get the document associated with our mac address
        if (Firebase.Firestore.getDocument(&fbdo, "iotstruggle", "", documentPath.c_str(), fieldPath.c_str())){
          //Serial.printf("ok\n%s\n\n", fbdo.payload().c_str());
          jsonPayload.setJsonData(fbdo.payload().c_str());

          // Get the data from FirebaseJson object 
          jsonPayload.get(jsonData, "fields/displayName/stringValue", true);
          //Serial.println(jsonData.stringValue);
          // this will be what we display on the lcd
          displayName = jsonData.stringValue;
          uidError = false;
        }
        else{
          Serial.println(fbdo.errorReason());
          uidError = true;
        }
      }
      else{
        //same uid
        uidError = false;
      }
    }
    else{
      Serial.println(fbdo.errorReason());
      uidError = true;
    }
  }

  //Serial.println(". . . End Grabbing User Info");
}

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

  //indicator stuff
  pinMode(indicatorLED, INPUT);

  //beginning LCD wire
  Wire.begin(SDA, SCL);           // attach the IIC pin
  if (!i2CAddrTest(0x27)) {
    lcd = LiquidCrystal_I2C(0x3F, 16, 2);
  }
  lcd.init();                     // LCD driver initialization
  lcd.backlight();                // Open the backlight
  
  Serial.println("-=-=-=<< Ready for Main Functionality >>=-=-=-");
  lcd.setCursor(0,0);             // Move the cursor to row 0, column 0
  lcd.print("Start");     // The print content is displayed on the LCD
  lcd.setCursor(0,1); 
  lcd.print("Program!");
  delay(1000);
}

void loop() {

  grabUserInfo();
  lcd.clear();
  lcd.setCursor(0,0);             // Move the cursor to row 0, column 0
  lcd.print("Current User:");     // The print content is displayed on the LCD
  lcd.setCursor(0,1); 
  lcd.print(displayName);

  if (uidError){
    Serial.println("There is an error");
  }

  if ((digitalRead(indicatorLED) == HIGH) && (!uidError)){
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
  delay(100);
}