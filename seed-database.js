const Database = require('better-sqlite3');
const path = require('path');

// Use development database
const dbPath = path.join(__dirname, 'ispindel-data-dev.db');
const db = new Database(dbPath);

console.log('Seeding development database with test data...\n');

// Clear existing data
db.exec('DELETE FROM device_history');
console.log('✓ Cleared existing data');

// Prepare insert statement
const insertStmt = db.prepare(`
  INSERT INTO device_history (
    device_id, device_name, timestamp, angle, temperature, 
    temp_units, battery, gravity, interval, rssi
  ) VALUES (
    @device_id, @device_name, @timestamp, @angle, @temperature,
    @temp_units, @battery, @gravity, @interval, @rssi
  )
`);

// Configuration
const DAYS = 15;
const INTERVAL_MINUTES = 15;
const INTERVAL_SECONDS = INTERVAL_MINUTES * 60;
const INTERVAL_MS = INTERVAL_SECONDS * 1000;

// Calculate total data points
const totalMinutes = DAYS * 24 * 60;
const totalPoints = Math.floor(totalMinutes / INTERVAL_MINUTES);

console.log(`Generating ${totalPoints} data points per device over ${DAYS} days`);
console.log(`Data points every ${INTERVAL_MINUTES} minutes\n`);

// Device configurations
const devices = [
  {
    id: 'iSpindel001',
    name: 'Pale Ale Batch #42',
    startGravity: 1.055,
    endGravity: 1.012,
    startTemp: 68,
    endTemp: 72,
    startBattery: 4.2,
    endBattery: 3.7
  },
  {
    id: 'iSpindel002',
    name: 'IPA Batch #23',
    startGravity: 1.065,
    endGravity: 1.015,
    startTemp: 66,
    endTemp: 70,
    startBattery: 4.1,
    endBattery: 3.6
  }
];

// Start time (15 days ago)
const endTime = Date.now();
const startTime = endTime - (DAYS * 24 * 60 * 60 * 1000);

// Generate data for each device
const insertMany = db.transaction((device, points) => {
  for (let i = 0; i < points; i++) {
    const timestamp = startTime + (i * INTERVAL_MS);
    const progress = i / points; // 0 to 1
    
    // Simulate fermentation curve (rapid at first, then slowing)
    const fermentationProgress = 1 - Math.pow(1 - progress, 2);
    
    // Calculate gravity (decreasing over time with fermentation curve)
    const gravity = device.startGravity - 
      (device.startGravity - device.endGravity) * fermentationProgress;
    
    // Calculate temperature (slight variation with daily cycles)
    const dailyCycle = Math.sin((timestamp / (24 * 60 * 60 * 1000)) * Math.PI * 2);
    const tempVariation = dailyCycle * 1.5; // +/- 1.5°F daily variation
    const avgTemp = device.startTemp + (device.endTemp - device.startTemp) * progress;
    const temperature = avgTemp + tempVariation;
    
    // Calculate angle (correlates with gravity, with some noise)
    const baseAngle = 25 + ((1.065 - gravity) * 400); // Rough correlation
    const angle = baseAngle + (Math.random() - 0.5) * 0.5; // Small random variation
    
    // Battery decreases linearly
    const battery = device.startBattery - 
      (device.startBattery - device.endBattery) * progress;
    
    // RSSI varies randomly
    const rssi = -65 + Math.floor(Math.random() * 20) - 10; // -75 to -55
    
    insertStmt.run({
      device_id: device.id,
      device_name: device.name,
      timestamp: timestamp,
      angle: Math.round(angle * 100) / 100,
      temperature: Math.round(temperature * 10) / 10,
      temp_units: 'F',
      battery: Math.round(battery * 100) / 100,
      gravity: Math.round(gravity * 1000) / 1000,
      interval: INTERVAL_SECONDS,
      rssi: rssi
    });
  }
});

// Insert data for each device
devices.forEach(device => {
  console.log(`Inserting data for ${device.name} (${device.id})...`);
  insertMany(device, totalPoints);
  console.log(`✓ Inserted ${totalPoints} data points`);
});

// Verify data
const count = db.prepare('SELECT COUNT(*) as count FROM device_history').get();
const dateRange = db.prepare(`
  SELECT 
    MIN(timestamp) as first_timestamp,
    MAX(timestamp) as last_timestamp
  FROM device_history
`).get();

console.log(`\n✅ Database seeded successfully!`);
console.log(`Total records: ${count.count}`);
console.log(`Date range: ${new Date(dateRange.first_timestamp).toLocaleString()} to ${new Date(dateRange.last_timestamp).toLocaleString()}`);
console.log(`\nYou can now view the data at http://localhost:5001`);

db.close();

