'use strict';

var assert = require('chai').assert;
var rule = require('../../../lib/rules/maxLength.js');

describe('maxLength', function () {
  it('should have a message', function () {
    assert.equal(rule.message, 'is too long');
  });

  it('should pass strings meeting the requirement', function () {
    assert.isTrue(rule('abc', 3));
  });

  it('should pass arrays meeting the requirement', function () {
    assert.isTrue(rule([1, 2, 3], 3));
  });

  it('should fail strings which do not meet the requirement', function () {
    assert.isFalse(rule('abc', 2));
  });

  it('should fail arrays which do not meet the requirement', function () {
    assert.isFalse(rule([1, 2, 3], 2));
  });

  it('should fail values without a length property', function () {
    assert.isFalse(rule({}, 4));
    assert.isFalse(rule(1, 4));
    assert.isFalse(rule(true, 4));
  });
});
