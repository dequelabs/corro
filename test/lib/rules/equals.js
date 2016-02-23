'use strict';

var assert = require('chai').assert;
var rule = require('../../../lib/rules/equals.js');

describe('equals', function () {
  it('should have a message', function () {
    assert.equal(rule.message, 'values are not equal');
  });
  
  it('should pass values which are equal', function () {
    var ctx = {
      passwordField: 'my password',
      confirmField: 'my password'
    };

    assert.isTrue(rule.apply({context: ctx}, ['my password', 'confirmField']));
  });

  it('should fail values which are not equal', function () {
    var ctx = {
      passwordField: 'my password',
      confirmField: 'mu oassword'
    };

    assert.isFalse(rule.apply({context: ctx}, ['my password', 'confirmField']));
  });
});
