'use strict';

var _ = require('lodash');

exports = module.exports = {
  'required': {
    func: function (val) { return val !== null && val !== undefined; },
    message: 'is required'
  },
  'minLength': {
    func: function (val, len) { return !val || (val.hasOwnProperty('length') && val.length >= len); },
    message: 'is too short'
  },
  'type': {
    func: function (val, type) {
      if (!val) { return true; }

      switch(type) {
        case 'array': return _.isArray(val);
        case 'object': return _.isObject(val) && !_.isArray(val);
        case 'string': return _.isString(val);
        case 'number': return _.isNumber(val);
      }
    },
    message: 'expected $1'
  }
};
