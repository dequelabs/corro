'use strict';

var isObject = require('lodash.isobject');
var parseInt = require('lodash.parseint');

exports = module.exports = function (val, max) {
  val = isObject(val) ? NaN : parseInt(val.toString());

  return !isNaN(val) && val <= max;
};

exports.message = 'is too big';
