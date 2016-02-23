'use strict';

exports = module.exports = function (val, arr) {
  return arr.indexOf(val) === -1;
};

exports.message = 'present in excluded values';
exports.argArray = true;
