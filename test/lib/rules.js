'use strict';

var assert = require('chai').assert;
var rules = require('../../lib/rules.js');

describe('rules', function () {
  describe('required', function () {
    var rule = rules.required.func;

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
	});

  describe('match', function () {
    var rule = rules.match.func;

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

    it('should fail objects', function () {
      assert.isFalse(rule({field: 'value'}, /object/)); // test against what it would toString() as
    });

    it('should fail arrays', function () {
      assert.isFalse(rule(['abc'], /abc/));
    });

    it('should pass null values', function () {
      assert.isTrue(rule(null, /o+/));
    });

    it('should pass undefined values', function () {
      assert.isTrue(rule(undefined, /o+/));
    });
  });

  describe('maxLength', function () {
    var rule = rules.maxLength.func;

    it('should pass strings meeting the requirement', function () {
      assert.isTrue(rule('abc', 3));
    });

    it('should pass arrays meeting the requirement', function () {
      assert.isTrue(rule([1, 2, 3], 3));
    });

    it('should pass nulls', function () {
      assert.isTrue(rule(null, 4));
    });

    it('should pass undefined', function () {
      assert.isTrue(rule(undefined, 4));
    });

    it('should fail strings which do not the requirement', function () {
      assert.isFalse(rule('abc', 2));
    });

    it('should fail arrays which do not the requirement', function () {
      assert.isFalse(rule([1, 2, 3], 2));
    });

    it('should fail values without a length property', function () {
      assert.isFalse(rule({}, 4));
    });
  });

  describe('minLength', function () {
    var rule = rules.minLength.func;

    it('should pass strings meeting the requirement', function () {
      assert.isTrue(rule('abc', 3));
    });

    it('should pass arrays meeting the requirement', function () {
      assert.isTrue(rule([1, 2, 3], 3));
    });

    it('should pass nulls', function () {
      assert.isTrue(rule(null, 4));
    });

    it('should pass undefined', function () {
      assert.isTrue(rule(undefined, 4));
    });

    it('should fail strings which do not the requirement', function () {
      assert.isFalse(rule('abc', 4));
    });

    it('should fail arrays which do not the requirement', function () {
      assert.isFalse(rule([1, 2, 3], 4));
    });

    it('should fail values without a length property', function () {
      assert.isFalse(rule({}, 4));
    });
  });

  describe('notEmpty', function () {
    var rule = rules.notEmpty.func;

    it('should pass strings with stuff in them', function () {
      assert.isTrue(rule('a'));
    });

    it('should fail empty strings', function () {
      assert.isFalse(rule(''));
    });

    it('should fail whitespace-only strings', function () {
      assert.isFalse(rule('       \t\r\n   '));
    });

    it('should pass nulls', function () {
      assert.isTrue(rule(null));
    });

    it('should pass undefined', function () {
      assert.isTrue(rule());
    });
  });

  describe('type', function () {
    var rule = rules.type.func;

    it('should validate strings only as strings', function () {
      assert.isTrue(rule('abc', 'string'));
      assert.isFalse(rule('abc', 'number'));
      assert.isFalse(rule('abc', 'object'));
      assert.isFalse(rule('abc', 'array'));
    });

    it('should validate numbers only as numbers', function () {
      assert.isFalse(rule(1, 'string'));
      assert.isTrue(rule(1, 'number'));
      assert.isFalse(rule(1, 'object'));
      assert.isFalse(rule(1, 'array'));
    });

    it('should validate objects only as objects', function () {
      assert.isFalse(rule({field: 'value'}, 'string'));
      assert.isFalse(rule({field: 'value'}, 'number'));
      assert.isTrue(rule({field: 'value'}, 'object'));
      assert.isFalse(rule({field: 'value'}, 'array'));
    });

    it('should validate arrays only as arrays', function () {
      assert.isFalse(rule(['abc'], 'string'));
      assert.isFalse(rule(['abc'], 'number'));
      assert.isFalse(rule(['abc'], 'object'));
      assert.isTrue(rule(['abc'], 'array'));
    });

    it('should validate nulls as anything', function () {
      assert.isTrue(rule(null, 'string'));
      assert.isTrue(rule(null, 'number'));
      assert.isTrue(rule(null, 'object'));
      assert.isTrue(rule(null, 'array'));
    });

    it('should validate undefined as anything', function () {
      assert.isTrue(rule(undefined, 'string'));
      assert.isTrue(rule(undefined, 'number'));
      assert.isTrue(rule(undefined, 'object'));
      assert.isTrue(rule(undefined, 'array'));
    });
  });
});
