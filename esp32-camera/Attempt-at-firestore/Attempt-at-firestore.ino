#include <Firebase_ESP_Client.h>
#include "Arduino.h"
#include <WiFi.h>
#include <addons/TokenHelper.h> //token generation

#define AP_SSID "SpectrumSetup-0F"
#define AP_PASS "botanykey125"

#define API_KEY "AIzaSyAmoJ66G3mH61Pv2Spn-ypNHQOgS-Oe6bg"
#define STORAGE_BUCKET_ID "iotstruggle.appspot.com"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig configF;

bool signUpOk = false;

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

void setup() {
  Serial.begin(115200);
  initWiFi();

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

  //then, once all the connections are done...
  if (Firebase.ready()){
    String documentPath = "Mac-To-Users/" + WiFi.macAddress();
    String fieldPath = "ActiveUserID";
    FirebaseJson jsonPayload;
    FirebaseJsonData jsonData;
    //FirebaseJson content;
    //get the document associated with our mac address
    //Firebase.Firestore.getDocument(&fbdo, iotstruggle, WiFi.macAddress()) 
    if (Firebase.Firestore.getDocument(&fbdo, "iotstruggle", "", documentPath.c_str(), fieldPath.c_str())){
      Serial.printf("ok\n%s\n\n", fbdo.payload().c_str());
        jsonPayload.setJsonData(fbdo.payload().c_str());

        // Get the data from FirebaseJson object 
        jsonPayload.get(jsonData, "fields/ActiveUserID/stringValue", true);
        Serial.println(jsonData.stringValue);
    }
    else{
      Serial.println(fbdo.errorReason());
    }
  }
}

void loop() {
  // put your main code here, to run repeatedly:

}
