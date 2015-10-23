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
    if (rule.argArray) { args = [args]; }

    var result = rule.func.apply(this, [val].concat(args || []));

    if (_.isBoolean(result) && !result) {
      return [format.apply(this, [rule.message].concat(args))];
    } else if (_.isArray(result)) {
      return result;
    }
  }

  return [];
};

Corro.prototype.evaluateObject = function (schema, object, key) {
  var self = this;
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
  var result = rules.map(function (name) {
    return {
      name: name,
      result: !!self.rules[name] ? self.runRule(self.rules[name], object, schema[name]) : ['invalid rule specified']
    };
  })
  .reduce(function (acc, r) {
    var isCompound = r.result.length > 1;

    return r.result.reduce(function (acc, res, idx) {
      if (!acc[key]) { acc[key] = []; }

      var name = isCompound ? format('{}-{}', r.name, idx) : r.name;
      var ruleResult = {rule: name, result: res};
      if (!!self.rules[name] && self.rules[name].includeArgs !== false) {
        ruleResult.args = schema[r.name];
      }

      acc[key].push(ruleResult);

      return acc;
    }, acc);
  }, {});

  if (_.isArray(object) && children.length > 1) {
    // if multiple subschemata exist for an array, we're screwed -- they might conflict, and there's no way to recover. just abort.
    // this is a bit of a structural lacuna, ideally there'd be a recursive 'values' or 'items' rule but there are Problems there
    result[key] = [{message: 'multiple array subschemata provided'}];
  } else if (!!object) {
    result = children.map(function (name) {
      var node = schema[name];

      if (_.isArray(object)) {
        return object.map(function (element, idx) {
          return self.evaluateObject(node, element, key + '.' + idx);
        });
      } else {
        var child = key ? key + '.' + name : name;

        return [self.evaluateObject(node, object[name], child)];
      }
    })
    .reduce(function (acc, arr) {
      return arr.reduce(function (acc, res) { // bad form to hide it but it's literally the same thing
        return _.merge(acc, res);
      }, acc);
    }, result);
  }

  return result;
};

Corro.prototype.validate = function (schema, obj) {
  var results = this.evaluateObject(schema, obj);

  return {
    valid: Object.keys(results).length === 0,
    errors: results
  };
};

exports = module.exports = Corro;
