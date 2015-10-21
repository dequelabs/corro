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
      return [format.apply(this, [rule.message].concat(args))];
    } else if (_.isArray(result)) {
      return result;
    }
  }

  return [];
};

Corro.prototype.evaluateObject = function (schema, object, key) {
  var self = this;
  var result = {};
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
  rules.map(function (name) {
      return {
        rule: name,
        args: schema[name],
        result: self.runRule(self.rules[name], object, schema[name])
      };
    })
  .filter(function (r) { return r.result.length > 0; })
  .forEach(function (r) {
    if (!result[key]) { result[key] = []; }

    result[key].push(r);
  });

  // also bail early if object is falsy since there's not much point checking for children
  if (!_.isEmpty(result) || !object) { return result; }

  if (_.isArray(object) && children.length > 1) {
    // if multiple subschemata exist for an array, we're screwed -- they might conflict, and there's no way to recover. just abort.
    // this is a bit of a structural lacuna, ideally there'd be a recursive 'values' or 'items' rule but there are Problems there
    // in its current state with rule: null this is totally a hack i'm throwing in temporarily. please let it go away quickly
    result[key] = [{rule: null, message: 'multiple array subschemata provided'}];
  } else {
    children.map(function (name) {
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
    .filter(function (r) { return !_.isEmpty(r); })
    .forEach(function (item) {
      item.forEach(function (r) {
        Object.keys(r).forEach(function (k) {
          result[k] = r[k];
        });
      });
    });
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
