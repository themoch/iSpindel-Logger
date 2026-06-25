const Database = require('better-sqlite3');
const path = require('path');

// Determine database file based on environment
const environment = process.env.NODE_ENV || 'development';
const dbFileName = environment === 'production'
  ? 'ispindel-data.db'
  : 'ispindel-data-dev.db';

const dbPath = path.join(__dirname, '../../', dbFileName);
const db = new Database(dbPath);

console.log(`Using ${environment} database: ${dbFileName}`);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS device_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    device_name TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    angle REAL,
    temperature REAL,
    temp_units TEXT,
    battery REAL,
    gravity REAL,
    interval INTEGER,
    rssi INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE INDEX IF NOT EXISTS idx_device_timestamp 
    ON device_history(device_id, timestamp DESC);
  
  CREATE INDEX IF NOT EXISTS idx_timestamp 
    ON device_history(timestamp DESC);
`);

// Prepared statements for better performance
const insertDataStmt = db.prepare(`
  INSERT INTO device_history (
    device_id, device_name, timestamp, angle, temperature, 
    temp_units, battery, gravity, interval, rssi
  ) VALUES (
    @device_id, @device_name, @timestamp, @angle, @temperature,
    @temp_units, @battery, @gravity, @interval, @rssi
  )
`);

const getHistoryStmt = db.prepare(`
  SELECT 
    timestamp,
    angle,
    temperature,
    temp_units,
    battery,
    gravity,
    interval,
    rssi
  FROM device_history
  WHERE device_id = ?
    AND timestamp >= ?
  ORDER BY timestamp ASC
`);

const getLatestDataStmt = db.prepare(`
  SELECT 
    device_id,
    device_name,
    timestamp,
    angle,
    temperature,
    temp_units,
    battery,
    gravity,
    interval,
    rssi
  FROM device_history
  WHERE id IN (
    SELECT MAX(id)
    FROM device_history
    GROUP BY device_id
  )
  ORDER BY timestamp DESC
`);

/**
 * Insert device data into the database
 */
function insertDeviceData(data) {
  try {
    insertDataStmt.run({
      device_id: data.ID,
      device_name: data.name,
      timestamp: data.timestamp || Date.now(),
      angle: data.angle,
      temperature: data.temperature,
      temp_units: data.temp_units || 'C',
      battery: data.battery,
      gravity: data.gravity,
      interval: data.interval,
      rssi: data.RSSI
    });
  } catch (error) {
    console.error('Error inserting device data:', error);
    throw error;
  }
}

/**
 * Get device history for a specific time range
 * @param {string} deviceId - Device ID
 * @param {number} daysBack - Number of days to look back (default: 45)
 */
function getDeviceHistory(deviceId, daysBack = 45) {
  const cutoffTime = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
  
  try {
    const rows = getHistoryStmt.all(deviceId, cutoffTime);
    
    // Format the data to match the expected format
    return rows.map(row => ({
      time: new Date(row.timestamp).toLocaleString(),
      timestamp: row.timestamp,
      angle: row.angle,
      temperature: row.temperature,
      temp_units: row.temp_units,
      battery: row.battery,
      gravity: row.gravity,
      interval: row.interval,
      RSSI: row.rssi
    }));
  } catch (error) {
    console.error('Error getting device history:', error);
    return [];
  }
}

/**
 * Get the latest data for all devices
 */
function getLatestDeviceData() {
  try {
    const rows = getLatestDataStmt.all();
    
    return rows.map(row => ({
      ID: row.device_id,
      name: row.device_name,
      time: new Date(row.timestamp).toLocaleString(),
      angle: row.angle,
      temperature: row.temperature,
      temp_units: row.temp_units,
      battery: row.battery,
      gravity: row.gravity,
      interval: row.interval,
      RSSI: row.rssi
    }));
  } catch (error) {
    console.error('Error getting latest device data:', error);
    return [];
  }
}

module.exports = {
  db,
  insertDeviceData,
  getDeviceHistory,
  getLatestDeviceData
};

