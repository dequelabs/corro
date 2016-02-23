'use strict';

var assert = require('chai').assert;
var rule = require('../../../lib/rules/match.js');

describe('match', function () {
  it('should not include arguments in the result', function () {
    assert.isFalse(rule.includeArgs);
  });

  it('should have a message', function () {
    assert.equal(rule.message, 'does not match supplied pattern');
  });

  it('should pass content matching a regex', function () {
    assert.isTrue(rule('bloop', /b[lw]o+p/));
  });

  it('should fail content not matching a regex', function () {
    assert.isFalse(rule('bloop', /b[lw]op/));
  });

  it('should match anywhere in the string (barring anchors)', function () {
    assert.isTrue(rule('bloop', /o+/));
  });

  it('should coerce numbers to strings', function () {
    assert.isTrue(rule(1234, /\d+/));
  });

  it('should not throw if horribly misused', function () {
    assert.doesNotThrow(function () { rule({field: 'value'}, /obj/); });
    assert.doesNotThrow(function () { rule(['abc'], /abc/); });
    assert.doesNotThrow(function () { rule(true, /abc/); });
  });
});
