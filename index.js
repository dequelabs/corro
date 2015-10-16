'use strict';

var _ = require('lodash');

var Corro = function () {
  return this;
};

Corro.prototype.validate = function (schema, obj) {
  var result = Object.keys(schema).reduce(function (result, key) {
    var ruleset = schema[key];
    var field = obj[key];

    // apply each rule in the corresponding ruleset definition to field
    var ruleResult = Object.keys(ruleset).reduce(function (acc, name) {
      var rule = ruleset[name];

      if (name === 'required' && (field === null || field === undefined)) {
        acc[key] = 'is required';
      }

      return acc;
    }, {});

    if (!_.isEmpty(ruleResult)) {
      result.valid = false;
      result.errors.push(ruleResult);
    }

    return result;
  }, {
    valid: true,
    errors: []
  });

  console.log(result);

  return result;
};

exports = module.exports = new Corro();
