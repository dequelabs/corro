'use strict';

var assert = require('chai').assert;
var rule = require('../../../lib/rules/max.js');

describe('max', function () {
  it('should have a message', function () {
    assert.equal(rule.message, 'is too big');
  });

  it('should pass numbers meeting the requirement', function () {
    assert.isTrue(rule(3, 3));
    assert.isTrue(rule(0, 0));
  });

  it('should parse strings', function () {
    assert.isTrue(rule('3', 3));
  });

  it('should fail numbers which do not meet the requirement', function () {
    assert.isFalse(rule(4, 3));
  });

  it('should fail non-numeric values', function () {
    assert.isFalse(rule(true, 2));
    assert.isFalse(rule('hello', 2));
    assert.isFalse(rule([1, 2, 3], 2));
    assert.isFalse(rule({field: 'value'}, 2));
  });
});
