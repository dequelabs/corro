'use strict';

/* jshint -W101 */
var formats = {
    url: /^(https?|ftp):\/\/(-\.)?([^\s/?\.#]+\.?)+(\/?[^\s]*)?$/,
    email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    ipv6: /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i,
    hostname: /^(([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])$/i,
    objectId: /^[a-f\d]{24}$/i,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
};

exports = module.exports = function (val, format) {
  /* jshint maxcomplexity: 12 */
  if (!val) { return true; }

  switch(format) {
    case 'url': return formats.url.test(val);
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
