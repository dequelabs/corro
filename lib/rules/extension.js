'use strict';

var path = require('path');

exports = module.exports = function (filename, arr) {
  return arr.indexOf(path.extname(filename).substring(1)) > -1;
};

exports.message = 'file extension is not supported';
