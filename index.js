'use strict';

var _ = require('lodash');
var defaults = require('./lib/rules');

var Corro = function (rules) {
  console.log('ctor');
  this.rules = rules || {};

  _.merge(this.rules, defaults, function (customRule) { // 2nd param is defaultRule but we always go with custom
    return customRule;
  });

  console.log(Object.keys(this.rules).length);
  return this;
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
  console.log(rules);
  console.log(children);

  // run rules first, so we can exit early if we're missing required subobjects
  rules.reduce(function (acc, name) {
    console.log('evaluating rule for object: ', object);
    var rule = self.rules[name];

    var args = [object].concat(schema[name] || []);
    var ruleResult = rule.func.apply(self, args);

    if (!ruleResult) { acc.push(rule.message); }

    return acc;
  }, []).forEach(addResult);

  if (!_.isEmpty(result)) { return result; }

  // now process child objects
  children.reduce(function (acc, name) {
    var node = schema[name];

    console.log('checking node', node);

    var subResult;

    if (_.isArray(object)) {
      console.log('object is an array');
      subResult = object.reduce(function (arrayResult, element, idx) {
        arrayResult.push(self.evaluateObject(node, element, key + '.' + idx));

        return arrayResult;
      }, []);
    } else {
      console.log('object[name] = ', object[name]);
      subResult = self.evaluateObject(node, object[name], key + '.' + name);
    }

    console.log('subresult: ', subResult);

    acc = acc.concat(subResult);

    return acc;
  }, []).forEach(addResult);

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
