#define indicatorLED    15

void setup() {
  // put your setup code here, to run once:
  pinMode(indicatorLED, OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:

  digitalWrite(indicatorLED, HIGH);
  delay(1000);
  digitalWrite(indicatorLED, LOW);
  delay(5000);

}
