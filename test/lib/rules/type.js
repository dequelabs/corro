'use strict';

var assert = require('chai').assert;
var rule = require('../../../lib/rules/type.js');

describe('type', function () {
  it('should have a message', function () {
    assert.equal(rule.message, 'expected {0}');
  });

  it('should validate strings only as strings', function () {
    assert.isTrue(rule('abc', 'string'));
    assert.isFalse(rule('abc', 'number'));
    assert.isFalse(rule('abc', 'object'));
    assert.isFalse(rule('abc', 'array'));
    assert.isFalse(rule('abc', 'date'));
    assert.isFalse(rule('abc', 'json'));
  });

  it('should validate numbers as numbers (but also dates and json because technically)', function () {
    assert.isFalse(rule(1, 'string'));
    assert.isTrue(rule(1, 'number'));
    assert.isFalse(rule(1, 'object'));
    assert.isFalse(rule(1, 'array'));
    assert.isTrue(rule(1, 'date'));
    assert.isTrue(rule(1, 'json'));
  });

  it('should validate objects as objects and as json', function () {
    assert.isFalse(rule({field: 'value'}, 'string'));
    assert.isFalse(rule({field: 'value'}, 'number'));
    assert.isTrue(rule({field: 'value'}, 'object'));
    assert.isFalse(rule({field: 'value'}, 'array'));
    assert.isFalse(rule({field: 'value'}, 'date'));
    assert.isTrue(rule({field: 'value'}, 'json'));
  });

  it('should validate arrays only as arrays', function () {
    assert.isFalse(rule(['abc'], 'string'));
    assert.isFalse(rule(['abc'], 'number'));
    assert.isFalse(rule(['abc'], 'object'));
    assert.isTrue(rule(['abc'], 'array'));
    assert.isFalse(rule(['abc'], 'date'));
    assert.isFalse(rule(['abc'], 'json'));
  });

  it('should validate dates as dates (but also objects because technically)', function () {
    assert.isFalse(rule(new Date(), 'string'));
    assert.isFalse(rule(new Date(), 'number'));
    assert.isTrue(rule(new Date(), 'object'));
    assert.isFalse(rule(new Date(), 'array'));
    assert.isTrue(rule(new Date(), 'date'));
    assert.isFalse(rule(new Date(), 'json'));
  });

  it('should validate stringified json as json (and also strings)', function () {
    assert.isTrue(rule('{"field": "value"}', 'string'));
    assert.isFalse(rule('{"field": "value"}', 'number'));
    assert.isFalse(rule('{"field": "value"}', 'object'));
    assert.isFalse(rule('{"field": "value"}', 'array'));
    assert.isFalse(rule('{"field": "value"}', 'date'));
    assert.isTrue(rule('{"field": "value"}', 'json'));
  });
});
