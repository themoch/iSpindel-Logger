const express = require('express');
const os = require('os');
const bodyParser = require('body-parser');
const open = require('open');

const app = express();
const iSpindelData = [];

app.use(express.static('dist'));

app.use(bodyParser.json({
  limit: '100kb',
}));

app.get('/api/getData', (req, res) => res.send(iSpindelData));

app.use(express.json());

app.post('/', (req, res) => {
  const existingIndex = iSpindelData.findIndex(spindel => spindel.ID === req.body.ID);
  const time = new Date();
  const formattedNumber = ( number ) => ('0' + number).slice(-2);
  req.body.time = `${time.getHours()}:${formattedNumber(time.getMinutes())}:${formattedNumber(time.getSeconds())}`;

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
