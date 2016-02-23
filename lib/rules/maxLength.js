'use strict';

exports = module.exports = function (val, len) {
  return val.hasOwnProperty('length') && val.length <= len;
};

exports.message = 'is too long';
