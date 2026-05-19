https://aistudio.google.com/prompts/1Y7FTDa_zyVi_5Jk4ouNWhdK4s1Spf9Xc

// // mpu6050_smoke_test.ino — CSV streaming mode (50 Hz)
// Output format: ax,ay,az,gx,gy,gz  (raw int16 values, one line per sample)
// Pair with the p5.js brush sketch in esp32/p5_brush/sketch.js
//
// Wiring: SDA=GPIO21, SCL=GPIO22, VCC=3V3, GND=GND

#include <Wire.h>

const uint8_t MPU_ADDR = 0x68;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  // Wake the MPU-6050 (clear sleep bit in PWR_MGMT_1)
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B);
  Wire.write(0x00);
  Wire.endTransmission();

  // Gyro full-scale: +/- 500 deg/s  (0x08 → FS_SEL=1)
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x1B);
  Wire.write(0x08);
  Wire.endTransmission();
}

void loop() {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);              // Start reading at ACCEL_XOUT_H
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, (uint8_t)14);

  int16_t ax = Wire.read() << 8 | Wire.read();
  int16_t ay = Wire.read() << 8 | Wire.read();
  int16_t az = Wire.read() << 8 | Wire.read();
  Wire.read(); Wire.read();      // Skip TEMP_OUT (2 bytes)
  int16_t gx = Wire.read() << 8 | Wire.read();
  int16_t gy = Wire.read() << 8 | Wire.read();
  int16_t gz = Wire.read() << 8 | Wire.read();

  // CSV: ax,ay,az,gx,gy,gz
  Serial.print(ax); Serial.print(",");
  Serial.print(ay); Serial.print(",");
  Serial.print(az); Serial.print(",");
  Serial.print(gx); Serial.print(",");
  Serial.print(gy); Serial.print(",");
  Serial.println(gz);

  delay(20); // 50 Hz
}