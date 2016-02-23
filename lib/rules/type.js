'use strict';

var _ = require('lodash');

exports = module.exports = function (val, type) {
  switch(type) {
    case 'array': return _.isArray(val);
    case 'object': return _.isObject(val) && !_.isArray(val);
    case 'string': return _.isString(val);
    case 'number': return _.isNumber(val);
    case 'date': return _.isDate(val) || !isNaN(Date.parse(val));
    case 'json':
      if (_.isPlainObject(val)) { return true; }
      else {
        try {
          JSON.parse(val);

          return true;
        } catch(e) {
          return false;
        }
      }
  }
};

exports.message = 'expected {0}';
