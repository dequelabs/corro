'use strict';

var assert = require('chai').assert;
var rule = require('../../../lib/rules/value.js');

describe('value', function () {
  it('should evaluate null values', function () {
    assert.isTrue(rule.evaluateNull);
  });

  it('should evaluate with false args', function () {
    assert.isTrue(rule.alwaysRun);
  });

  it('should have a message', function () {
    assert.equal(rule.message, 'expected {0}');
  });

  it('should pass matching values', function () {
    assert.isTrue(rule('value', 'value'));
    assert.isTrue(rule(1, 1));
    assert.isTrue(rule(true, true));
    assert.isTrue(rule(false, false));
    assert.isTrue(rule(null, null));
    assert.isTrue(rule());
  });

  it('should fail mismatching values', function () {
    assert.isFalse(rule('value', 'eulav'));
    assert.isFalse(rule(1, 2));
    assert.isFalse(rule(true, false));
    assert.isFalse(rule(true, undefined));
  });
});
