'use strict';

var assert = require('chai').assert;
var rules = require('../../lib/rules.js');

describe('rules', function () {
  describe('required', function () {
    var rule = rules.required;

    it('should evaluate null and undefined values', function () {
      assert.isTrue(rule.evaluateNull);
      assert.isTrue(rule.evaluateUndefined);
    });

    it('should pass true', function () {
      assert.isTrue(rule.func(true));
    });

    it('should pass false', function () {
      assert.isTrue(rule.func(false));
    });

    it('should pass strings', function () {
      assert.isTrue(rule.func('hello'));
    });

    it('should pass numbers', function () {
      assert.isTrue(rule.func(123));
    });

    it('should pass objects', function () {
      assert.isTrue(rule.func({field: 'value'}));
    });

    it('should pass arrays', function () {
      assert.isTrue(rule.func([1, 2, 3]));
    });

    it('should fail nulls', function () {
      assert.isFalse(rule.func(null));
    });

    it('should fail undefined', function () {
      assert.isFalse(rule.func(undefined));
    });
	});

  describe('match', function () {
    var rule = rules.match;

    it('should pass content matching a regex', function () {
      assert.isTrue(rule.func('bloop', /b[lw]o+p/));
    });

    it('should fail content not matching a regex', function () {
      assert.isFalse(rule.func('bloop', /b[lw]op/));
    });

    it('should match anywhere in the string (barring anchors)', function () {
      assert.isTrue(rule.func('bloop', /o+/));
    });

    it('should coerce numbers to strings', function () {
      assert.isTrue(rule.func(1234, /\d+/));
    });

    it('should not throw if horribly misused', function () {
      assert.doesNotThrow(function () { rule.func({field: 'value'}, /obj/); });
      assert.doesNotThrow(function () { rule.func(['abc'], /abc/); });
      assert.doesNotThrow(function () { rule.func(true, /abc/); });
    });
  });

  describe('max', function () {
    var rule = rules.max;

    it('should pass numbers meeting the requirement', function () {
      assert.isTrue(rule.func(3, 3));
    });

    it('should parse strings', function () {
      assert.isTrue(rule.func('3', 3));
    });

    it('should fail numbers which do not meet the requirement', function () {
      assert.isFalse(rule.func(4, 3));
    });

    it('should fail non-numeric values', function () {
      assert.isFalse(rule.func(true, 2));
      assert.isFalse(rule.func('hello', 2));
      assert.isFalse(rule.func([1, 2, 3], 2));
      assert.isFalse(rule.func({field: 'value'}, 2));
    });
  });

  describe('maxLength', function () {
    var rule = rules.maxLength;

    it('should pass strings meeting the requirement', function () {
      assert.isTrue(rule.func('abc', 3));
    });

    it('should pass arrays meeting the requirement', function () {
      assert.isTrue(rule.func([1, 2, 3], 3));
    });

    it('should fail strings which do not meet the requirement', function () {
      assert.isFalse(rule.func('abc', 2));
    });

    it('should fail arrays which do not meet the requirement', function () {
      assert.isFalse(rule.func([1, 2, 3], 2));
    });

    it('should fail values without a length property', function () {
      assert.isFalse(rule.func({}, 4));
      assert.isFalse(rule.func(1, 4));
      assert.isFalse(rule.func(true, 4));
    });
  });

  describe('min', function () {
    var rule = rules.min;

    it('should pass numbers meeting the requirement', function () {
      assert.isTrue(rule.func(3, 3));
    });

    it('should parse strings', function () {
      assert.isTrue(rule.func('3', 3));
    });

    it('should fail numbers which do not meet the requirement', function () {
      assert.isFalse(rule.func(2, 3));
    });

    it('should fail non-numeric values', function () {
      assert.isFalse(rule.func(true, 2));
      assert.isFalse(rule.func('hello', 2));
      assert.isFalse(rule.func([1, 2, 3], 2));
      assert.isFalse(rule.func({field: 'value'}, 2));
    });
  });

  describe('minLength', function () {
    var rule = rules.minLength;

    it('should pass strings meeting the requirement', function () {
      assert.isTrue(rule.func('abc', 3));
    });

    it('should pass arrays meeting the requirement', function () {
      assert.isTrue(rule.func([1, 2, 3], 3));
    });

    it('should fail strings which do not meet the requirement', function () {
      assert.isFalse(rule.func('abc', 4));
    });

    it('should fail arrays which do not meet the requirement', function () {
      assert.isFalse(rule.func([1, 2, 3], 4));
    });

    it('should fail values without a length property', function () {
      assert.isFalse(rule.func({}, 4));
      assert.isFalse(rule.func(1, 4));
      assert.isFalse(rule.func(true, 4));
    });
  });

  describe('notEmpty', function () {
    var rule = rules.notEmpty;

    it('should pass strings with stuff in them', function () {
      assert.isTrue(rule.func('a'));
    });

    it('should fail empty strings', function () {
      assert.isFalse(rule.func(''));
    });

    it('should fail whitespace-only strings', function () {
      assert.isFalse(rule.func('       \t\r\n   '));
    });

    it('should fail non-strings', function () {
      assert.isFalse(rule.func(true));
      assert.isFalse(rule.func(1));
      assert.isFalse(rule.func({}));
      assert.isFalse(rule.func([]));
    });
  });

  describe('type', function () {
    var rule = rules.type;

    it('should validate strings only as strings', function () {
      assert.isTrue(rule.func('abc', 'string'));
      assert.isFalse(rule.func('abc', 'number'));
      assert.isFalse(rule.func('abc', 'object'));
      assert.isFalse(rule.func('abc', 'array'));
    });

    it('should validate numbers only as numbers', function () {
      assert.isFalse(rule.func(1, 'string'));
      assert.isTrue(rule.func(1, 'number'));
      assert.isFalse(rule.func(1, 'object'));
      assert.isFalse(rule.func(1, 'array'));
    });

    it('should validate objects only as objects', function () {
      assert.isFalse(rule.func({field: 'value'}, 'string'));
      assert.isFalse(rule.func({field: 'value'}, 'number'));
      assert.isTrue(rule.func({field: 'value'}, 'object'));
      assert.isFalse(rule.func({field: 'value'}, 'array'));
    });

    it('should validate arrays only as arrays', function () {
      assert.isFalse(rule.func(['abc'], 'string'));
      assert.isFalse(rule.func(['abc'], 'number'));
      assert.isFalse(rule.func(['abc'], 'object'));
      assert.isTrue(rule.func(['abc'], 'array'));
    });
  });
});
