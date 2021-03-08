const path = require('path');
const fs = require('fs');

module.exports = {
  appPath: () => {
    const pathString = path.dirname(__dirname)
      .split('/');
    pathString.pop();
    return pathString.join('/');
  },
  copyCSV: (appPath, filePath) => {
    const csvFileServer = `${appPath}/src/csv/${filePath}`;
    const csvFileDist = `${appPath}/dist/${filePath}`;

    fs.copyFile(csvFileServer, csvFileDist, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  }
};
