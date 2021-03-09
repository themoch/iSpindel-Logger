const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const helpers = require('./helpers.js');

module.exports = {
  createCSV: (data) => {
    const {
      angle,
      temperature,
      battery,
      gravity,
      time
    } = data;

    const record = [{
      angle,
      temperature,
      battery,
      gravity,
      time
    }];
    const fileName = `${data.name}_${data.ID}.csv`;
    const directoryPath = `${helpers.appPath()}/src/csv/`;
    const filePath = `${directoryPath}${fileName}`;
    const csvWriterHeader = [
      {
        id: 'angle',
        title: 'ANGLE'
      },
      {
        id: 'temperature',
        title: 'TEMPERATURE'
      },
      {
        id: 'battery',
        title: 'BATTERY'
      },
      {
        id: 'gravity',
        title: 'GRAVITY'
      },
      {
        id: 'time',
        title: 'TIME'
      }
    ];

    const csvWriterParams = {
      path: filePath,
      header: csvWriterHeader
    };

    // check for directory
    if (!fs.existsSync(directoryPath)) {
      // if no directory make it
      fs.mkdirSync(directoryPath);
    }

    // check for file and if it exists: append
    if (fs.existsSync(filePath)) {
      csvWriterParams.append = true;
    }

    createCsvWriter(csvWriterParams)
      .writeRecords(record)
      .then(() => {
        helpers.copyCSV(helpers.appPath(), fileName);
      })
      .catch((err) => {
        console.log('createCsvWriter Error: ', err);
      });
  }
};
