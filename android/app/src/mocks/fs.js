// src/mocks/fs.js
const fs = {
  readFile: (path, encoding, callback) => {
    if (typeof encoding === 'function') {
      callback = encoding;
    }
    callback(null, '');
  },
  readFileSync: (path, encoding) => {
    return '';
  },
  writeFile: (path, data, encoding, callback) => {
    if (typeof encoding === 'function') {
      callback = encoding;
    }
    callback(null);
  },
  writeFileSync: (path, data, encoding) => {
    return;
  },
  // Add more mock functions if necessary
};

module.exports = fs;
