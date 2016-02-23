'use strict';

var assert = require('chai').assert;
var rule = require('../../../lib/rules/none.js');

describe('none', function () {
  it('should take array args', function () {
    assert.isTrue(rule.argArray);
  });

  it('should have a message', function () {
    assert.equal(rule.message, 'present in excluded values');
  });

  it('should pass values absent from the supplied array', function () {
    assert.isTrue(rule('one', ['hi', 'hello']));
  });

  it('should fail values present in the supplied array', function () {
    assert.isFalse(rule('one', ['one', 'two']));
  });
});
