'use strict';

var assert = require('chai').assert;
var rule = require('../../../lib/rules/notEmpty.js');

describe('notEmpty', function () {
  it('should not include arguments in the result', function () {
    assert.isFalse(rule.includeArgs);
  });

  it('should have a message', function () {
    assert.equal(rule.message, 'cannot be blank');
  });

  it('should pass strings with stuff in them', function () {
    assert.isTrue(rule('a'));
  });

  it('should fail empty strings', function () {
    assert.isFalse(rule(''));
  });

  it('should fail whitespace-only strings', function () {
    assert.isFalse(rule('       \t\r\n   '));
  });

  it('should fail non-strings', function () {
    assert.isFalse(rule(true));
    assert.isFalse(rule(1));
    assert.isFalse(rule({}));
    assert.isFalse(rule([]));
  });
});
