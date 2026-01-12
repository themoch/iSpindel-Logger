const express = require('express');
const os = require('os');
const bodyParser = require('body-parser');
const open = require('open');

const app = express();
const iSpindelData = [];
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
  const time = new Date();
  const formattedNumber = ( number ) => ('0' + number).slice(-2);
  req.body.time = `${time.getHours()}:${formattedNumber(time.getMinutes())}:${formattedNumber(time.getSeconds())}`;

  // Store gravity history (keep last 50 data points)
  if (!gravityHistory[req.body.ID]) {
    gravityHistory[req.body.ID] = [];
  }
  gravityHistory[req.body.ID].push({
    time: req.body.time,
    gravity: req.body.gravity,
    temperature: req.body.temperature,
    battery: req.body.battery,
    timestamp: time.getTime()
  });

  // Keep only the last 50 data points
  if (gravityHistory[req.body.ID].length > 50) {
    gravityHistory[req.body.ID].shift();
  }

  if (existingIndex > -1) {
    iSpindelData.splice(existingIndex, 1, req.body);
  } else {
    iSpindelData.push(req.body);
  }

  res.send(iSpindelData);
});

app.listen(process.env.PORT || 5000, () => {
  const OSLocal = os.platform() !== 'win32' ? 'http://localhost' : 'http://127.0.0.1';
  console.log(`Listening on port ${process.env.PORT || 5000}!`);
  open(`${OSLocal}:${process.env.PORT || 5000}`);
});
