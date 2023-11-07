// LED Pins
#define TRASH_SCAN_LED 15
#define WASTE_LED 33
#define RECYCLE_LED 32
#define WASTE_FULL_LED 12
#define RECYCLE_FULL_LED 14

// Variables
bool trashPresent = false;
bool wasteBinFull = false;
bool recycleBinFull = false;

void setup() 
{
  // Initialize serial and wait for port to open
  Serial.begin(9600);
  // This delay gives the chance to wait for a Serial Monitor without blocking if none is found
  delay(1500); 

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
  int trash_scan_distance = 8;

  if(trash_scan_distance > 0 && trash_scan_distance <= TRIGGER_DISTANCE) 
  {
    trashPresent = true;
  } 
  else
  {
    trashPresent = false;
  }

  // Check if trash is present 
  if(trashPresent)
  {
    digitalWrite(TRASH_SCAN_LED, HIGH); // Turn on White LED

    delay(5000); // Delay 5 seconds

    // Turn off White LED
    digitalWrite(TRASH_SCAN_LED, LOW);

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
  int waste_distance = 0;

  if(waste_distance > 0 && waste_distance <= TRIGGER_DISTANCE) 
  {
    wasteBinFull = true;
  } 
  else
  {
    wasteBinFull = false;
  }

  // If the waste bin is full, turn on the red LED
  if (wasteBinFull) 
  {
    digitalWrite(WASTE_FULL_LED, HIGH);
  } 
  else 
  {
    digitalWrite(WASTE_FULL_LED, LOW);
  }

  // Todo: Get recycle Ultra Sonic Sensor distance value from other ESP
  int recycle_distance = 0;

  if(recycle_distance > 0 && recycle_distance <= TRIGGER_DISTANCE) 
  {
    recycleBinFull = true;
  } 
  else
  {
    recycleBinFull = false;
  }

  // If the recycle bin is full, turn on the red LED
  if (recycleBinFull) 
  {
    digitalWrite(RECYCLE_FULL_LED, HIGH);
  } 
  else 
  {
    digitalWrite(RECYCLE_FULL_LED, LOW);
  }
}

