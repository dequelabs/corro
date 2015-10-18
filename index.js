'use strict';

var _ = require('lodash');

var Corro = function () {
  return this;
};

Corro.prototype.rules = {
  'required': {
    func: function (val) { return !!val; },
    message: 'is required'
  }
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

  // run rules first, so we can exit early if we're missing required subobjects
  Object.keys(schema)
    .filter(function (k) { return !_.isPlainObject(schema[k]); })
    .reduce(function (acc, name) {
      console.log('evaluating rule for object: ', object);

      var ruleResult = self.rules[name].func(object);

      if (!ruleResult) { acc.push(self.rules[name].message); }

      return acc;
    }, []).forEach(addResult);

  if (!_.isEmpty(result)) { return result; }

  var children = Object.keys(schema).filter(function (k) { return _.isPlainObject(schema[k]); });

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
      console.log('subresult: ', subResult);
      acc = acc.concat(subResult);
    } else {
      console.log('object[name] = ', object[name]);
      subResult = self.evaluateObject(node, object[name], key + '.' + name);
      console.log('subresult: ', subResult);
      acc = acc.concat(subResult);
    }

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
