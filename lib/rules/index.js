'use strict';

/**
 * Exports the default rules
 */
exports = module.exports = {
  any: require('./any'),
  anyField: require('./anyField'),
  conform: require('./conform'),
  equals: require('./equals'),
  extension: require('./extension'),
  format: require('./format'),
  match: require('./match'),
  max: require('./max'),
  maxLength: require('./maxLength'),
  min: require('./min'),
  minLength: require('./minLength'),
  none: require('./none'),
  not: require('./notDefined'),
  notEmpty: require('./notEmpty'),
  required: require('./required'),
  type: require('./type'),
  value: require('./value')
};
