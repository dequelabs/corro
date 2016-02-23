'use strict';

var _ = require('lodash');

exports = module.exports = function (val, dependency) {
  if (_.isString(dependency) && (this.context[dependency] === null || this.context[dependency] === undefined)) { return true; }

  return val !== null && val !== undefined;
};

exports.message = 'is required';
exports.alwaysRun = true;
exports.includeArgs = false;
