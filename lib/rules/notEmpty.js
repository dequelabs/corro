'use strict';

var isString = require('lodash.isstring');

exports = module.exports = function (val) {
  return isString(val) && val.trim().length > 0;
};

exports.message = 'cannot be blank';
exports.includeArgs = false;
