'use strict';

var _ = require('lodash');
var format = require('string-format');
var defaults = require('./lib/rules');

var Corro = function (rules) {
  this.rules = rules || {};

  _.merge(this.rules, defaults, function (customRule) { // 2nd param is defaultRule but we always go with custom
    return customRule;
  });

  return this;
};

Corro.prototype.runRule = function (rule, val, args) {
  if (rule.alwaysRun || (val !== null && val !== undefined)) {
    var result = rule.func.apply(this, [val].concat(args || []));

    if (_.isBoolean(result) && !result) {
      return format.apply(this, [rule.message].concat(args));
    } else if (_.isArray(result)) {
      return result;
    }
  }

  return null;
};

Corro.prototype.evaluateObject = function (schema, object, key) {
  var self = this;

  var result = {};
  var addResult = function (item) {
    if (item.hasOwnProperty('rule')) {
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
    var rule = self.rules[name];
    var ruleResult = self.runRule(rule, object, schema[name]);

    if (_.isArray(ruleResult)) {
      acc = acc.concat(ruleResult.map(function (r) {
        return {rule: name, args: [], message: r};
      }));
    } else if (ruleResult) {
      acc.push({rule: name, args: schema[name], message: ruleResult});
    }

    return acc;
  }, []).forEach(addResult);

  if (!_.isEmpty(result)) { return result; }

  if (_.isArray(object) && children.length > 1) {
    // if multiple subschemata exist for an array, we're screwed -- they might conflict, and there's no way to recover. just abort.
    // this is a bit of a structural lacuna, ideally there'd be a recursive 'values' or 'items' rule but there are Problems there
    addResult('multiple array subschemata provided');
  } else {
    children.reduce(function (acc, name) {
      var node = schema[name];

      if (_.isArray(object)) {
        acc = acc.concat(object.reduce(function (arrayResult, element, idx) {
          arrayResult.push(self.evaluateObject(node, element, key + '.' + idx));

          return arrayResult;
        }, []));
      } else if (object) {
        var child = key ? key + '.' + name : name;

        acc = acc.concat(self.evaluateObject(node, object[name], child));
      }

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

  return result;
};

exports = module.exports = Corro;
