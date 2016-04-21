'use strict';

exports = module.exports = function (val, expected) {
  return val === expected;
};

exports.message = 'expected {0}';

exports.alwaysRun = true;
exports.evaluateNull = true;
