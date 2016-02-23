'use strict';

var _ = require('lodash');

exports = module.exports = function (val) {
  return _.isString(val) && val.trim().length > 0;
};

exports.message = 'cannot be blank';
exports.includeArgs = false;
