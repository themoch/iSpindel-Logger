const express = require('express');
const os = require('os');
const bodyParser = require('body-parser');

const app = express();
const iSpindelData = [];
const daysInHistory = 45;
const gravityHistory = {}; // Store historical gravity data per device

app.use(express.static('dist'));

app.use(bodyParser.json({
  limit: '100kb',
}));

app.get('/api/getData', (req, res) => {
  // Attach history to each device
  const dataWithHistory = iSpindelData.map(spindel => ({
    ...spindel,
    history: gravityHistory[spindel.ID] || []
  }));
  res.send(dataWithHistory);
});

app.use(express.json());

app.post('/', (req, res) => {
  const existingIndex = iSpindelData.findIndex(spindel => spindel.ID === req.body.ID);

  // Use the provided timestamp or current time
  const timestamp = req.body.timestamp || Date.now();
  const time = new Date(timestamp);
  const formattedNumber = ( number ) => ('0' + number).slice(-2);
  req.body.time = `${time.getHours()}:${formattedNumber(time.getMinutes())}:${formattedNumber(time.getSeconds())}`;
  const intervalsInADay =  (60 * 60 * 24) / req.body.interval;
  const historyIntervals = intervalsInADay * daysInHistory;

  // Store gravity history (keep last daysInHistory days of data)
  if (!gravityHistory[req.body.ID]) {
    gravityHistory[req.body.ID] = [];
  }
  gravityHistory[req.body.ID].push({
    time: req.body.time,
    gravity: req.body.gravity,
    temperature: req.body.temperature,
    battery: req.body.battery,
    timestamp: timestamp
  });

  // Keep only the last number of data points as set by the days in daysInHistory value above
  if (gravityHistory[req.body.ID].length > historyIntervals) {
    gravityHistory[req.body.ID].shift();
  }

  if (existingIndex > -1) {
    iSpindelData.splice(existingIndex, 1, req.body);
  } else {
    iSpindelData.push(req.body);
  }

  res.send(iSpindelData);
});

app.listen(process.env.PORT || 5000, async () => {
  const OSLocal = os.platform() !== 'win32' ? 'http://localhost' : 'http://127.0.0.1';
  console.log(`Listening on port ${process.env.PORT || 5000}!`);
  const open = (await import('open')).default;
  await open(`${OSLocal}:${process.env.PORT || 5000}`);
});
