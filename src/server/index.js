const express = require('express');
const os = require('os');
const bodyParser = require('body-parser');
const { insertDeviceData, getDeviceHistory, getLatestDeviceData } = require('./database');

const defaultPort = 5001;
const app = express();
const daysInHistory = 45;

app.use(express.static('dist'));

app.use(bodyParser.json({
  limit: '100kb',
}));

app.get('/api/getData', (req, res) => {
  // Get latest data for all devices from database
  const latestData = getLatestDeviceData();

  // Attach history to each device
  const dataWithHistory = latestData.map(spindel => ({
    ...spindel,
    history: getDeviceHistory(spindel.ID, daysInHistory)
  }));

  res.send(dataWithHistory);
});

app.use(express.json());

app.post('/', (req, res) => {
  // Use the provided timestamp or current time
  const timestamp = req.body.timestamp || Date.now();

  // Insert data into database
  try {
    insertDeviceData({
      ID: req.body.ID,
      name: req.body.name,
      timestamp: timestamp,
      angle: req.body.angle,
      temperature: req.body.temperature,
      temp_units: req.body.temp_units,
      battery: req.body.battery,
      gravity: req.body.gravity,
      interval: req.body.interval,
      RSSI: req.body.RSSI
    });

    console.log(`Data received from ${req.body.name} (${req.body.ID})`);
    res.status(200).send({ success: true });
  } catch (error) {
    console.error('Error storing data:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

app.listen(process.env.PORT || defaultPort, async () => {
  const OSLocal = os.platform() !== 'win32' ? 'http://localhost' : 'http://127.0.0.1';
  console.log(`Listening on port ${process.env.PORT || defaultPort}!`);
  const open = (await import('open')).default;
  await open(`${OSLocal}:${process.env.PORT || defaultPort}`);
});
