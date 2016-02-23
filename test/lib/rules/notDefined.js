'use strict';

var assert = require('chai').assert;
var rule = require('../../../lib/rules/notDefined.js');

describe('notDefined', function () {
  it('should always run', function () {
    assert.isTrue(rule.alwaysRun);
  });

  it('should have a message', function () {
    assert.equal(rule.message, 'should not be defined');
  });

  it('should pass undefined values', function () {
    assert.isTrue(rule());
    assert.isTrue(rule(undefined));
    assert.isTrue(rule({}.field));
  });

  it('should fail defined values', function () {
    assert.isFalse(rule('hi'));
    assert.isFalse(rule(null));
    assert.isFalse(rule(false));
  });
});
