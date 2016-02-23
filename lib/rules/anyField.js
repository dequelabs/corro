'use strict';

exports = module.exports = function (_, arr) {
  var self = this;
  var val = arr.pop();

  return arr.some(function (field) {
    return self.context[field] === val;
  });
};

exports.message = 'value not contained in any specified field';
exports.argArray = true;
