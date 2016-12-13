'use strict';

var _ = require('lodash');

/* jshint -W101 */
var formats = {
    email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    ipv6: /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i,
    hostname: /^(([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])$/i,
    objectId: /^[a-f\d]{24}$/i,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
};

function validateUrl(value) {
  function pop(delimiter, required) {
    var segment, idx = value.lastIndexOf(delimiter);

    if (idx > -1) {
      segment = value.substring(idx + delimiter.length);

      value = value.substring(0, idx);
    } else if (required) {
      segment = value;

      value = '';
    }

    return segment;
  }

  var fragment = pop('#');
  var query = pop('?');
  var hier = pop('://', true);
  var scheme = value || 'http';

  // allowed protocols
  if (!_.includes(['http', 'https', 'ftp'], scheme)) { return false; }

  var tokens = hier.split(/[:\/]/);
  var host = tokens.shift();

  // ip or hostname
  if (!(formats.hostname.test(host) || formats.ipv4.test(host) || formats.ipv6.test(host))) { return false; }
  // port
  if (hier.indexOf(':') > -1 && !/\d{2,5}/.test(tokens.shift())) { return false; }
  // path tokens
  if (tokens.some(function (tok) { return /[\s/\\]/.test(tok); })) { return false; }
  // querystring
  if (query && query.split('&').some(function (tok) { return /[\s]/.test(tok); })) { return false; }
  // fragment
  if (fragment && /[\s]/.test(fragment)) { return false; }

  return true;
}

exports = module.exports = function (val, format) {
  /* jshint maxcomplexity: 12 */
  if (!val) { return true; }

  switch(format) {
    case 'url': return validateUrl(val);
    case 'email': return formats.email.test(val);
    case 'ipv4': return formats.ipv4.test(val);
    case 'ipv6': return formats.ipv6.test(val);
    case 'hostname': return val.length < 256 && formats.hostname.test(val);
    case 'hostnameOrIp': return (val.length < 256 && formats.hostname.test(val)) ||
      formats.ipv4.test(val) ||
      formats.ipv6.test(val);
    case 'objectId': return formats.objectId.test(val);
    case 'uuid': return formats.uuid.test(val);
  }
};

exports.message = 'expected format {0}';
