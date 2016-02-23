'use strict';

var _ = require('lodash');

exports = module.exports = function (val, max) {
  val = _.isObject(val) ? NaN : _.parseInt(val.toString());

  return !isNaN(val) && val >= max;
};

exports.message = 'is too big';
