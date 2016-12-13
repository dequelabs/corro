'use strict';

exports = module.exports = function (val, expected) {
  return val !== expected;
};

exports.message = 'expected anything but {0}';

exports.alwaysRun = true;
exports.evaluateNull = true;
