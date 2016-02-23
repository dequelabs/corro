'use strict';

exports = module.exports = function (val, regex) {
  return regex.test(val.toString());
};

exports.message = 'does not match supplied pattern';
exports.includeArgs = false;  // JSON.stringify clobbers it anyway
