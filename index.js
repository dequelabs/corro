'use strict';

var _ = require('lodash');

var Corro = function () {
  return this;
};

var evaluateObject = function (schema, object, key) {
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

    var rules = Object.keys(schema).filter(function (k) { return !_.isPlainObject(schema[k]); });

    // run rules first, so we can exit early if we're missing required subobjects
    rules.reduce(function (acc, name) {
      console.log('evaluating rule for object: ', object);
      // fake out rules here for now
      if (name === 'required' && (object === null || object === undefined)) {
        acc.push('is required');
      }

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
          arrayResult.push(evaluateObject(node, element, key + '.' + idx));

          return arrayResult;
        }, []);
        console.log('subresult: ', subResult);
        acc = acc.concat(subResult);
      } else {
        console.log('object[name] = ', object[name]);
        subResult = evaluateObject(node, object[name], key + '.' + name);
        console.log('subresult: ', subResult);
        acc = acc.concat(subResult);
      }

      return acc;
  }, []).forEach(addResult);

  return result;
};

Corro.prototype.validate = function (schema, obj) {
  /*var errors = evaluateObject(schema, obj);

  console.log(errors);

  return {
    valid: errors.length > 0,
    errors: errors
  };*/
  var result = Object.keys(schema).reduce(function (acc, key) {
    // apply each rule in the corresponding ruleset definition to the field
    var nodeResult = evaluateObject(schema[key], obj[key], key);

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

exports = module.exports = new Corro();
