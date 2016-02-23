'use strict';

exports = module.exports = function (val, arr) {
  return arr.indexOf(val) > -1;
};

exports.message = 'not in allowed values';
exports.argArray = true;
