'use strict';

var assert = require('chai').assert;
var rule = require('../../../lib/rules/required.js');

describe('required', function () {
  it('should evaluate null and undefined values', function () {
    assert.isTrue(rule.alwaysRun);
  });

  it('should not include arguments in the result', function () {
    assert.isFalse(rule.includeArgs);
  });

  it('should have a message', function () {
    assert.equal(rule.message, 'is required');
  });

  it('should pass true', function () {
    assert.isTrue(rule(true));
  });

  it('should pass false', function () {
    assert.isTrue(rule(false));
  });

  it('should pass strings', function () {
    assert.isTrue(rule('hello'));
  });

  it('should pass numbers', function () {
    assert.isTrue(rule(123));
  });

  it('should pass objects', function () {
    assert.isTrue(rule({field: 'value'}));
  });

  it('should pass arrays', function () {
    assert.isTrue(rule([1, 2, 3]));
  });

  it('should fail nulls', function () {
    assert.isFalse(rule(null));
  });

  it('should fail undefined', function () {
    assert.isFalse(rule(undefined));
  });

  it('should pass anything if a dependency is supplied which does not itself pass', function () {
    assert.isTrue(rule.apply({context: {field: null, dependency: null}}, [null, 'dependency']));
    assert.isTrue(rule.apply({context: {field: true, dependency: null}}, [true, 'dependency']));
    assert.isFalse(rule.apply({context: {field: null, dependency: true}}, [null, 'dependency']));
    assert.isTrue(rule.apply({context: {field: true, dependency: true}}, [true, 'dependency']));
  });
});
