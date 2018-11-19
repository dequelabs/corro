'use strict';

var last = require('lodash.last');

exports = module.exports = function (ignore, arr) {
  var self = this;
  var val = last(arr);

  return arr.some(function (field) {
    return self.context[field] === val;
  });
};

exports.message = 'value not contained in any specified field';
exports.argArray = true;
