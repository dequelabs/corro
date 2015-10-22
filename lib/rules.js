'use strict';

var path = require('path');
var _ = require('lodash');

/* jshint -W101 */
var formats = {
    url: /^(https?|ftp):\/\/(-\.)?([^\s/?\.#]+\.?)+(\/[^\s]*)?$/,
    email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    ipv6: /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i,
    hostname: /^(([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])$/i,
    objectId: /^[a-f\d]{24}$/i,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
};

exports = module.exports = {
  'conform': {
    func: function (val) {
      var self = this;

      // since all argument lists are flattened into the function signature we
      // need to reconstitute from arguments itself
      var messages = _.reduce(_.slice(arguments, 1), function (acc, rule) {
        var result = self.runRule(rule, val);

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
    message: 'file extension is not supported'
  },
  'format': {
    func: function (val, format) {
      /* jshint maxcomplexity: 11 */
      if (!val) { return true; }

      switch(format) {
        case 'url': return formats.url.test(val);
        case 'email': return formats.email.test(val);
        case 'ipv4': return formats.ipv4.test(val);
        case 'ipv6': return formats.ipv6.test(val);
        case 'hostname': return val.length < 256 && formats.hostname.test(val);
        case 'hostnameOrIp': return (val.length < 256 && formats.hostname.test(val)) || formats.ipv4.test(val);
        case 'objectId': return formats.objectId.test(val);
        case 'uuid': return formats.uuid.test(val);
      }
    },
    message: 'expected format {0}'
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
    argArray: true,
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
    message: 'expected {0}'
  }
};
