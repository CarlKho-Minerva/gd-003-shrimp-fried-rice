#include <Wire.h>

const uint8_t MPU_ADDR = 0x68;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  Wire.setTimeOut(50); // IMPORTANT: Prevents I2C hang
  
  // Wake up MPU
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B);
  Wire.write(0x00);
  Wire.endTransmission();
}

void loop() {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  if (Wire.endTransmission(false) != 0) return; // Skip if bus error
  
  Wire.requestFrom(MPU_ADDR, (uint8_t)14);
  if (Wire.available() < 14) return;

  int16_t ax = Wire.read() << 8 | Wire.read();
  int16_t ay = Wire.read() << 8 | Wire.read();
  int16_t az = Wire.read() << 8 | Wire.read();
  Wire.read(); Wire.read(); // Skip Temp
  int16_t gx = Wire.read() << 8 | Wire.read();
  int16_t gy = Wire.read() << 8 | Wire.read();
  int16_t gz = Wire.read() << 8 | Wire.read();

  // Sending every 20ms (50 times per second) 
  // This is the sweet spot for browser stability
  Serial.printf("%d,%d,%d,%d,%d,%d\n", ax, ay, az, gx, gy, gz);

  delay(20); 
}