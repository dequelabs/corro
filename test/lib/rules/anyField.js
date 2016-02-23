'use strict';

var assert = require('chai').assert;
var rule = require('../../../lib/rules/anyField.js');

describe('anyField', function () {
  var ctx = {
    context: {
      field1: 'value1',
      field2: 'value2',
      field3: 'value3'
    },
    runRule: function () {}
  };

  it('should take array args', function () {
    assert.isTrue(rule.argArray);
  });

  it('should have a message', function () {
    assert.equal(rule.message, 'value not contained in any specified field');
  });

  it('should pass when the context has the specified value for at least one of the specified fields', function () {
    assert.isTrue(rule.apply(ctx, ['this is ignored', ['field1', 'field2', 'field3', 'value3']]));
  });

  it('should fail if none of the specified fields have the specified value', function () {
    assert.isFalse(rule.apply(ctx, ['this is ignored', ['field1', 'field2', 'field3', 'value4']]));
  });
});
