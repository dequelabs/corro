'use strict';

var _ = require('lodash');

// todo:
// - alphanumeric
// - contained in array
// - file extension contained in array
// - various formats (url, email, ip/ipv6, hostname, date/time stuff)
// - function executor. possibly args should be a dict of rule defs w/ messages like this is?
// interpolation~

exports = module.exports = {
  'required': {
    func: function (val) { return val !== null && val !== undefined; },
    alwaysRun: true,
    message: 'is required'
  },
  'conform': {
    handler: function (val, rules) {
      var self = this;

      var messages = rules.reduce(function (acc, rule) {
        var result = self.runRule(rule, [val]);

        if (_.isArray(result)) { acc = acc.concat(result); }
        else if (result) { acc.push(result); }

        return acc;
      }, []);

      if (messages.length === 0) { return true; }
      else { return messages; }
    },
    message: 'does not conform to specified rules'
  },
  'match': {
    func: function (val, regex) { return regex.test(val.toString()); },
    message: 'does not match supplied pattern'
  },
  'max': {
    func: function (val, max) {
      if (!_.parseInt(val.toString())) { return false; }

      return val <= max;
    },
    message: 'is too big'
  },
  'maxLength': {
    func: function (val, len) { return val.hasOwnProperty('length') && val.length <= len; },
    message: 'is too long'
  },
  'min': {
    func: function (val, min) {
      if (!_.parseInt(val.toString())) { return false; }

      return val >= min;
    },
    message: 'is too small'
  },
  'minLength': {
    func: function (val, len) { return val.hasOwnProperty('length') && val.length >= len; },
    message: 'is too short'
  },
  'notEmpty': {
    func: function (val) { return _.isString(val) && val.trim().length > 0; },
    message: 'cannot be blank'
  },
  'type': {
    func: function (val, type) {
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
