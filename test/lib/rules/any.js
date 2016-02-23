'use strict';

var assert = require('chai').assert;
var rule = require('../../../lib/rules/any.js');

describe('any', function () {
  it('should take array args', function () {
    assert.isTrue(rule.argArray);
  });

  it('should have a message', function () {
    assert.equal(rule.message, 'not in allowed values');
  });

  it('should pass values in the supplied array', function () {
    assert.isTrue(rule('hello', ['hi', 'hello']));
  });

  it('should fail values not in the supplied array', function () {
    assert.isFalse(rule('hi', ['one', 'two']));
  });
});
