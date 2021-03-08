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
    const filePath = `${helpers.appPath()}/src/csv/${fileName}`;
    const csvWriterHeader = [
      { id: 'angle', title: 'ANGLE' },
      { id: 'temperature', title: 'TEMPERATURE' },
      { id: 'battery', title: 'BATTERY' },
      { id: 'gravity', title: 'GRAVITY' },
      { id: 'time', title: 'TIME' }
    ];

    const csvWriterParams = {
      path: filePath,
      header: csvWriterHeader
    };

    fs.access(filePath, fs.constants.W_OK, (err) => {
      if (!err) {
        csvWriterParams.append = true;
      }

      createCsvWriter(csvWriterParams).writeRecords(record).then(() => {
        fs.stat(filePath, (err) => {
          if (!err) {
            helpers.copyCSV(helpers.appPath(), fileName);
          }
        });

        console.log('saved: ', record);
        console.log('append', csvWriterParams.append);
      });
    });
  }
};
