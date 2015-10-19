'use strict';

var _ = require('lodash');

exports = module.exports = {
  'required': {
    func: function (val) { return val !== null && val !== undefined; },
    message: 'is required'
  },
  'match': {
    func: function (val, regex) { return !val || (!_.isObject(val) && regex.test(val.toString())); },
    message: 'does not match supplied pattern'
  },
  'maxLength': {
    func: function (val, len) { return !val || (val.hasOwnProperty('length') && val.length <= len); },
    message: 'is too long'
  },
  'minLength': {
    func: function (val, len) { return !val || (val.hasOwnProperty('length') && val.length >= len); },
    message: 'is too short'
  },
  'notEmpty': {
    func: function (val) { return val === null || val === undefined || (_.isString(val) && val.trim().length > 0); },
    message: 'cannot be blank'
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
    message: 'expected $1'  // todo interpolation!!
  }
};
