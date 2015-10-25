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

Corro.prototype.runRule = function (ctx, rule, val, args) {
  // if we've been given a name instead of a rule block (from eg conform), look it up
  if (!_.isPlainObject(rule)) {
    if (!!this.rules[rule]) {
      rule = this.rules[rule];
    } else {
      return ['invalid rule specified'];
    }
  }

  if (rule.alwaysRun || (val !== null && val !== undefined)) {
    if (rule.argArray) { args = [args]; }

    var result = rule.func.apply({
      runRule: this.runRule,
      context: ctx
    }, [val].concat(args || []));

    if (_.isBoolean(result) && !result) {
      return [format.apply(this, [rule.message].concat(args))];
    } else if (_.isArray(result)) {
      return result;
    }
  }

  return [];
};

Corro.prototype.evaluateObject = function (ctx, schema, object, key) {
  var self = this;
  var rules = [], children = [];

  for (var k in schema) {
    if (schema.hasOwnProperty(k) && schema[k]) {    // skip stuff like required: false
      if (!_.isPlainObject(schema[k])) { rules.push(k);}
      else { children.push(k); }
    }
  }

  // run rules first, so we can exit early if we're missing required subobjects or have wrong types or whatever
  var result = rules.map(function (name) {
    return {
      name: name,
      result: self.runRule(ctx, name, object, schema[name])
    };
  })
  .reduce(function (acc, r) {
    var i = 0, len = r.result.length;
    var name = r.name, rule = self.rules[r.name];
    var row;

    if (len === 0) { return acc; }

    acc[key] = acc[key] || [];

    for (i; i < len; i++) {
      row = {
        rule: len === 1 ? name : format('{}-{}', r.name, i),
        result: r.result[i]
      };

      if (!!rule && rule.includeArgs !== false) {
        row.args = schema[r.name];
      }

      acc[key].push(row);
    }

    return acc;
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
          return self.evaluateObject(object, node, element, key + '.' + idx);
        });
      } else {
        var child = key ? key + '.' + name : name;

        return [self.evaluateObject(object, node, object[name], child)];
      }
    })
    .reduce(function (acc, arr) {
      var i = 0, len = arr.length;

      for (i; i < len; i++) { _.merge(acc, arr[i]); }

      return acc;
    }, result);
  }

  return result;
};

Corro.prototype.validate = function (schema, obj) {
  var results = this.evaluateObject(obj, schema, obj);

  return {
    valid: Object.keys(results).length === 0,
    errors: results
  };
};

exports = module.exports = Corro;
