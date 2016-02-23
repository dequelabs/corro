'use strict';

var assert = require('chai').assert;
var rule = require('../../../lib/rules/value.js');

describe('value', function () {
  it('should have a message', function () {
    assert.equal(rule.message, 'expected {0}');
  });

  it('should pass matching values', function () {
    assert.isTrue(rule('value', 'value'));
  });

  it('should fail mismatching values', function () {
    assert.isFalse(rule('value', 'eulav'));
  });
});
