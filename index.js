'use strict';

var defaults = require('./lib/rules');
var isPlainObject = require('lodash.isplainobject');
var isBoolean = require('lodash.isboolean');
var transform = require('lodash.transform');
var mergeWith = require('lodash.mergewith');
var merge = require('lodash.merge');
var clone = require('lodash.clone');
var format = require('string-format');

var Corro = function (rules) {
  rules = rules || {};
  this.rules = Object.assign({}, defaults, rules);

  return this;
};

function shouldRun(rule, val, args) {
  return (rule.evaluateNull || val !== null) &&
    (rule.evaluateUndefined || val !== undefined) &&
    (rule.alwaysRun || args !== false);
}

Corro.prototype.runRule = function (ctx, rule, val, args) {
  // if we've been given a name instead of a rule block (from eg conform), look it up
  if (!isPlainObject(rule)) {
    rule = this.rules[rule];

    if (!rule) { return ['invalid rule specified']; }
  }

  if (shouldRun(rule, val, args)) {
    if (args === undefined) { args = []; }
    if (rule.argArray) { args = [args]; }

    var func = rule.func || rule;   // for custom rule blocks

    var result = func.apply({
      runRule: this.runRule,
      context: ctx
    }, [val].concat(args));

    if (isBoolean(result) && !result) {
      return [format.apply(this, [rule.message].concat(args))];
    } else if (Array.isArray(result)) { // message array from conform
      return result;
    }
  }

  return [];
};

Corro.prototype.evaluateObject = function (ctx, schema, val, name) {
  var self = this;

  return transform(schema, function (result, args, key) {
    if (!isPlainObject(args)) {  // rule
      var res = {
        rule: key,
        result: self.runRule(ctx, key, val, args)
      };

      var len = res.result.length;

      if (len > 0) {
        if (self.rules[key].includeArgs !== false) { res.args = args; }

        var formatStr = len > 1 ? '{}-{}' : '{}';

        name = name || '*';   // nicer than "undefined" as a key for results on the root context

        result[name] = (result[name] || []).concat(res.result.map(function (r, idx) {
          res.rule = format(formatStr, key, idx);
          res.result = r;

          return clone(res);
        }));
      }
    } else if (!!val) {  // child object
      if (Array.isArray(val)) {
        return val.map(function (element, idx) {
          mergeWith(
            result,
            self.evaluateObject(val, args, element, name + '.' + idx),
            function (a, b) {
              if (Array.isArray(a)) { return a.concat(b); } // merge all results if multiple subschemata provided
              return b;
            });
        });
      } else {
        var child = name ? name + '.' + key : key;

        merge(result, self.evaluateObject(val, args, val[key], child));
      }
    }
  });
};

Corro.prototype.validate = function (schema, obj) {
  var results = this.evaluateObject(obj, schema, obj);

  return {
    valid: Object.keys(results).length === 0,
    errors: results
  };
};

exports = module.exports = Corro;
