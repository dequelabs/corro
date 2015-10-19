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
