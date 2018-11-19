'use strict';

var isObject = require('lodash.isobject');
var isString = require('lodash.isstring');
var isNumber = require('lodash.isnumber');
var isDate = require('lodash.isdate');
var isPlainObject = require('lodash.isplainobject');

exports = module.exports = function (val, type) {
  switch(type) {
    case 'array': return Array.isArray(val);
    case 'object': return isObject(val) && !Array.isArray(val);
    case 'string': return isString(val);
    case 'number': return isNumber(val);
    case 'date': return isDate(val) || !isNaN(Date.parse(val));
    case 'json':
      if (isPlainObject(val)) { return true; }
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
