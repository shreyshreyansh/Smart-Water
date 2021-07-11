//----------Libraries--------------//
#include <ESP8266WiFiMulti.h>
#include <ESP8266HTTPClient.h>
#include <ThingSpeak.h>
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>


//------------CONSTANTS---------------//
#define SCREEN_WIDTH 128    
#define SCREEN_HEIGHT 64    
#define OLED_RESET -1       
#define LED_BUILTIN 16
#define SENSOR D4

//---------Channel Details---------//
unsigned long counterChannelNumber = 1374592;
const int FieldNumber1 = 1; 

//----------WiFi Setup------------//
ESP8266WiFiMulti WiFiMulti;
WiFiClient client;


//-----------Display Screen Setup----------//
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

//----------------API Keys------------------//
String api_key = "PLYR51A2489LFDRA";
char* server = "api.thingspeak.com";
unsigned long channelID = 1374592;
char* readAPIKey = "YKIP3ZPQJXSX6KSV";
const char * myCounterReadAPIKey = "YKIP3ZPQJXSX6KSV";

//-------------------Variables------------------//
long currentMillis = 0;
long previousMillis = 0;
long c = 0;
long p = 0;
int interval = 1000;
boolean ledState = LOW;
float calibrationFactor = 4.5;
volatile byte pulseCount;
byte pulse1Sec = 0;
float flowRate;
unsigned long flowMilliLitres;
unsigned int totalMilliLitres;
float flowLitres;
float totalLitres;
bool start = false;
bool startAlert = false;
long currMillis = 0;
long prevMillis = 0;
unsigned int aField = 2;
unsigned int aConst = 5000;  
const char* host = "maker.ifttt.com";

//----------------Interrupt Service Routine-------------------//
void IRAM_ATTR pulseCounter() {
  pulseCount++;
}



void setup() {
  Serial.begin(115200);
  WiFi.disconnect();
  totalLitres = 0;
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C); //initialize with the I2C addr 0x3C (128x64)
  display.clearDisplay();
  delay(10);
  display.setCursor(10, 0);
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.println("Connecting...");
  wificonnect();
  aConst = readTSData( channelID, aField );

  //---------------- Channel----------------//
  display.clearDisplay();
  delay(10);
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println("Setting up the device...");

  startAlert = false;

  //---------------Initializing Pins-------------//
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(SENSOR, INPUT_PULLUP);

  //------------Initializing Variables---------------//
  pulseCount = 0;
  flowRate = 0.0;
  flowMilliLitres = 0;
  totalMilliLitres = 0;
  previousMillis = 0;

  //-------Attaching Interrupt to the pulse counter---------//
  attachInterrupt(digitalPinToInterrupt(SENSOR), pulseCounter, FALLING);
}

void wificonnect() {
  //------------Wifi Connection Method-------------------//
  WiFiMulti.addAP("iPhone11", "1jj1jj1jj");
  Serial.println("Conneting");
  while (WiFiMulti.run() != WL_CONNECTED) {
    Serial.print(".");
    digitalWrite(D0, LOW);
    delay(100);
    digitalWrite(D0, HIGH);
    delay(100);
  }
  Serial.print("Connected to HOTSPOT..\n");
  ThingSpeak.begin( client );
}

int readTSData( long TSChannel, unsigned int TSField ) {

  float data =  ThingSpeak.readIntField( TSChannel, TSField, readAPIKey );
  Serial.println( " Data read from ThingSpeak: " + String( data, 9 ) );
  return data;

}

void GETsend(float data) {
  //-------------HTTPS GET REQUEST-----------------//
  HTTPClient http;
  String url =  "http://api.thingspeak.com/update?api_key=";
  url += api_key;
  url += "&field";
  url += "1";
  url += "=";
  url += data;

  http.begin(url);

  Serial.print("HTTP REQUEST SENT, Waiting for response\n");

  int httpCode = http.GET();
  if (httpCode > 0) {
    Serial.printf("Sensor data uploaded sucessfully");
  } else {
    Serial.printf("Failed to connect to server");
  }
  http.end();
}

void sendEmail(int time){    
      // Your Domain name with URL path or IP address with path
      const int httpPort = 80;  
      if (!client.connect(host, httpPort)) {  
          Serial.println("connection failed");  
          return;
      }
      String url = "/trigger/Overflow/with/key/6o8TcPWY9hBHg2qPgCIFXFefdDY4_3tiUZXlL9Kw00RuVCA5RsyTj1ZXtlqR5nhY"; 
      client.print(String("GET ") + url + " HTTP/1.1\r\n" + "Host: " + host + "\r\n" +   "Connection: close\r\n\r\n");
}

void loop() {
  currentMillis = millis();
  if (currentMillis - previousMillis > interval)
  {
    pulse1Sec = pulseCount;
    pulseCount = 0;

    //-------Converting Pulse Counter to Flow Rate-----------//
    flowRate = ((1000.0 / (millis() - previousMillis)) * pulse1Sec) / calibrationFactor;

    previousMillis = millis();

    flowMilliLitres = (flowRate / 60) * 1000;
    flowLitres = (flowRate / 60);

    totalMilliLitres += flowMilliLitres;
    totalLitres += flowLitres;
      

    if (!start && flowRate != 0.0)
      start = true;

    if(!startAlert && flowRate != 0.0){
      startAlert = true;
      prevMillis = millis();
    }

    if(startAlert){
      currMillis = millis();
        Serial.println(aConst);
      if(currMillis - prevMillis > aConst){
        Serial.println("TAP IS OPEN");
        sendEmail(12);
        startAlert = false;
      }
    }

    //-----------OLED DISPLAY-----------//
    display.clearDisplay();
    display.setCursor(10, 0); //oled display
    display.setTextSize(1);
    display.setTextColor(WHITE);
    display.print("Water Flow Meter");

    display.setCursor(0, 20); //oled display
    display.setTextSize(2);
    display.setTextColor(WHITE);
    display.print("R:");
    display.print(float(flowRate));
    display.setCursor(100, 28); //oled display
    display.setTextSize(1);
    display.print("L/M");

    display.setCursor(0, 45); //oled display
    display.setTextSize(2);
    display.setTextColor(WHITE);
    display.print("V:");
    display.print(totalLitres);
    display.setCursor(100, 53); //oled display
    display.setTextSize(1);
    display.print("L");
    display.display();

    //------------SEND DATA-----------//
    c = millis();
    if (start && flowRate == 0.0 && ((c - p > 16000) || p == 0)) {
      GETsend(totalLitres);
      totalLitres = 0.0;
      flowMilliLitres = 0;
      p = millis();
      start = false;
      startAlert = false;
    }
  }

}
