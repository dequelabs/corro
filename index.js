'use strict';

var _ = require('lodash');

var Corro = function () {
  return this;
};

var evaluateObject = function (schema, object, key) {
    console.log('evaluatefield called for ' + key);
    var result = {};

    Object.keys(schema).reduce(function (acc, name) {
      var node = schema[name];

      // if it's an object, that's describing a subschema. try to recurse
      if (_.isPlainObject(node)) {
          console.log('node is a subobject');
          if (_.isObject(object)) {
              console.log('object[name] = ', object[name]);
              var subResult = evaluateObject(node, object[name], key + '.' + name);
              console.log('subresult: ', subResult);
              acc = acc.concat(subResult);
          } else {
              acc.push('schema mismatch');
          }
      } else {
          console.log('evaluating required for object: ', object);
          // fake out rules here for now
          if (name === 'required' && (object === null || object === undefined)) {
            acc.push('is required');
          }
      }

      return acc;
  }, []).forEach(function (item) {
    if (typeof item === 'string') {
      if (!result[key]) { result[key] = []; }

      result[key].push(item);
    } else {
      Object.keys(item).forEach(function (k) {
        result[k] = item[k];
      });
    }
  });

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
