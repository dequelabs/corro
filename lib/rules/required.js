'use strict';

var isString = require('lodash.isstring');

exports = module.exports = function (val, dependency) {
  if (isString(dependency) && (this.context[dependency] === null || this.context[dependency] === undefined)) { return true; }

  return val !== null && val !== undefined;
};

exports.message = 'is required';
exports.evaluateNull = true;
exports.evaluateUndefined = true;
exports.includeArgs = false;
