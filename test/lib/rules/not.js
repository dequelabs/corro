'use strict';

var assert = require('chai').assert;
var rule = require('../../../lib/rules/not.js');

describe('not', function () {
  it('should evaluate null values', function () {
    assert.isTrue(rule.evaluateNull);
  });

  it('should evaluate with false args', function () {
    assert.isTrue(rule.alwaysRun);
  });

  it('should have a message', function () {
    assert.equal(rule.message, 'expected anything but {0}');
  });

  it('should pass mismatching values', function () {
    assert.isTrue(rule('value', 'eulav'));
    assert.isTrue(rule(1, 2));
    assert.isTrue(rule(true, false));
    assert.isTrue(rule(true, undefined));
    assert.isTrue(rule(true, null));
  });

  it('should fail matching values', function () {
    assert.isFalse(rule('value', 'value'));
    assert.isFalse(rule(1, 1));
    assert.isFalse(rule(true, true));
    assert.isFalse(rule(null, null));
    assert.isFalse(rule());
  });
});
