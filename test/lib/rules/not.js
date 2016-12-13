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
    assert.equal(rule.message, 'values are equal');
  });

  it('should pass values which are not equal', function () {
    var ctx = {
      passwordField: 'my password',
      confirmField: 'not my password'
    };

    assert.isTrue(rule.apply({context: ctx}, ['my password', 'confirmField']));
  });

  it('should fail values which are equal', function () {
    var ctx = {
      passwordField: 'my password',
      confirmField: 'my password'
    };

    assert.isFalse(rule.apply({context: ctx}, ['my password', 'confirmField']));
  });
});
