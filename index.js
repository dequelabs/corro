'use strict';

var _ = require('lodash');
var defaults = require('./lib/rules');

var Corro = function (rules) {
  this.rules = rules || {};

  _.merge(this.rules, defaults, function (customRule) { // 2nd param is defaultRule but we always go with custom
    return customRule;
  });

  return this;
};

Corro.prototype.runRule = function (rule, args) {
  var result;

  if (rule.handler) {
    result = rule.handler.apply(this, args);

    return result;
  } else if (rule.alwaysRun || (args[0] !== null && args[0] !== undefined)) {
    result = rule.func.apply(this, args);

    if (!result) { return rule.message; }
  }

  return null;
};

Corro.prototype.evaluateObject = function (schema, object, key) {
  var self = this;
  console.log('evaluatefield called for ' + key);

  var result = {};
  var addResult = function (item) {
    if (typeof item === 'string') {
      if (!result[key]) { result[key] = []; }

      result[key].push(item);
    } else {
      Object.keys(item).forEach(function (k) {
        result[k] = item[k];
      });
    }
  };

  var rules = [], children = [];
  Object.keys(schema)
    .filter(function (k) { return schema[k]; }) // skip stuff like required: false
    .forEach(function (k) {
      if (!_.isPlainObject(schema[k])) {
        rules.push(k);
      } else {
        children.push(k);
      }
    });

  // run rules first, so we can exit early if we're missing required subobjects or have wrong types or whatever
  rules.reduce(function (acc, name) {
    console.log('evaluating rule for object: ', object);
    var rule = self.rules[name];
    var args = [object].concat(schema[name] || []);
    var ruleResult = self.runRule(rule, args);

    if (_.isArray(ruleResult)) { acc = acc.concat(ruleResult); }
    else if (ruleResult) { acc.push(ruleResult); }

    return acc;
  }, []).forEach(addResult);

  if (!_.isEmpty(result)) { return result; }

  if (_.isArray(object) && children.length > 1) {
    // if multiple subschemata exist for the array, we're screwed -- they might conflict, and there's no way to recover. just abort.
    addResult('multiple array subschemata provided');
  } else {
    children.reduce(function (acc, name) {
      var node = schema[name];

      var subResult;

      if (_.isArray(object)) {
        subResult = object.reduce(function (arrayResult, element, idx) {
          arrayResult.push(self.evaluateObject(node, element, key + '.' + idx));

          return arrayResult;
        }, []);
      } else {
        subResult = self.evaluateObject(node, object[name], key + '.' + name);
      }

      console.log('subresult: ', subResult);

      acc = acc.concat(subResult);

      return acc;
    }, []).forEach(addResult);
  }

  return result;
};

Corro.prototype.validate = function (schema, obj) {
  var self = this;
  var result = Object.keys(schema).reduce(function (acc, key) {
    // apply each rule in the corresponding ruleset definition to the field
    var nodeResult = self.evaluateObject(schema[key], obj[key], key);

    if (!_.isEmpty(nodeResult)) {
      acc.valid = false;

      acc.errors = _.merge(acc.errors, nodeResult);
    }

    return acc;
  }, {
    valid: true,
    errors: {}
  });

  console.log(JSON.stringify(result));

  return result;
};

exports = module.exports = Corro;
