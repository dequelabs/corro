'use strict';

var path = require('path');
var _ = require('lodash');

// todo:
// - function executor. possibly args should be a dict of rule defs w/ messages like this is?
// interpolation~

exports = module.exports = {
  'conform': {
    func: function (val, rules) {
      var self = this;

      var messages = rules.reduce(function (acc, rule) {
        var result = self.runRule(rule, [val]);

        if (_.isArray(result)) { acc = acc.concat(result); }
        else if (result) { acc.push(result); }

        return acc;
      }, []);

      if (messages.length === 0) { return true; }
      else { return messages; }
    }
  },
  'extension': {
    func: function (filename, arr) { return arr.indexOf(path.extname(filename).substring(1)) > -1; },
    message: 'file extension not supported'
  },
  'format': {
    func: function (val, format) {
      switch(format) {
        case 'url': return /^(https?|ftp):\/\/(-\.)?([^\s/?\.#]+\.?)+(\/[^\s]*)?$/.test(val);
        /* jshint -W101 */
        case 'email': return /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(val);
        case 'ipv4': return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(val);
        case 'ipv6': return /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i.test(val);
        case 'hostname': return val.length < 256 && /^(([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])$/i.test(val);
      }
    },
    message: 'expected format %s'
  },
  'match': {
    func: function (val, regex) { return regex.test(val.toString()); },
    message: 'does not match supplied pattern'
  },
  'max': {
    func: function (val, max) {
      val = _.isObject(val) ? NaN : _.parseInt(val.toString());

      return !isNaN(val) && val <= max;
    },
    message: 'is too big'
  },
  'maxLength': {
    func: function (val, len) { return val.hasOwnProperty('length') && val.length <= len; },
    message: 'is too long'
  },
  'min': {
    func: function (val, min) {
      val = _.isObject(val) ? NaN : _.parseInt(val.toString());

      return !isNaN(val) && val >= min;
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
  'present': {
    func: function (val, arr) { return arr.indexOf(val) > -1; },
    message: 'not in allowed values'
  },
  'required': {
    func: function (val) { return val !== null && val !== undefined; },
    alwaysRun: true,
    message: 'is required'
  },
  'type': {
    func: function (val, type) {
      switch(type) {
        case 'array': return _.isArray(val);
        case 'object': return _.isObject(val) && !_.isArray(val);
        case 'string': return _.isString(val);
        case 'number': return _.isNumber(val);
        case 'date': return _.isDate(val) || !isNaN(Date.parse(val));
      }
    },
    message: 'expected $1'  // todo interpolation!!
  }
};
