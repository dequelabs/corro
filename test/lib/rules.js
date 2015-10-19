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

  describe('extension', function () {
    var rule = rules.extension;

    it('should pass filenames with a valid extension', function () {
      assert.isTrue(rule.func('image.jpg', ['jpg', 'gif', 'png']));
    });

    it('should fail filenames without a valid extension', function () {
      assert.isFalse(rule.func('image.doc', ['jpg', 'gif', 'png']));
    });
  });

  describe('format', function () {
    var rule = rules.format;

    it('should validate urls', function () {
      // not supported:
      assert.isFalse(rule.func('test.com', 'url'));
      assert.isFalse(rule.func('www.test.com', 'url'));

      // supported:
      assert.isTrue(rule.func('http://127.0.0.1', 'url'));
      assert.isTrue(rule.func('http://127.0.0.1/test', 'url'));
      assert.isTrue(rule.func('http://test.com', 'url'));
      assert.isTrue(rule.func('http://www.test.com', 'url'));
      assert.isTrue(rule.func('http://www.test.com/test.html', 'url'));
      assert.isTrue(rule.func('http://www.test.com/test/test.html', 'url'));
      assert.isTrue(rule.func('http://www.test.com/test-hyphens/test-hyphens.html', 'url'));
      assert.isTrue(rule.func('https://www.test.com', 'url'));
      assert.isTrue(rule.func('ftp://www.test.com', 'url'));
      assert.isTrue(rule.func('http://www.test-hyphens.com', 'url'));
      assert.isTrue(rule.func('http://www.test.com/page(wikistyle)', 'url'));
      assert.isTrue(rule.func('http://www.test.com/?querystring=with+stuff&other=things', 'url'));
      assert.isTrue(rule.func('http://www.test.com/page-with?querystring=with+stuff&other=things', 'url'));

      // sanity check:
      assert.isFalse(rule.func('http://www.test.com?querystring=with+stuff&other=things', 'url'));  // no qs on hostname!
      assert.isFalse(rule.func('hello', 'url'));
      assert.isFalse(rule.func('there\'s a lot of stuff that isn\'t a url honestly', 'url'));
    });

    it('should validate emails', function () {
      // not supported:
      assert.isFalse(rule.func('"have some spaces"@test.com', 'email'));
      assert.isFalse(rule.func('üñîçøðé@test.com', 'email'));
      assert.isFalse(rule.func('test@local', 'email'));

      // supported:
      assert.isTrue(rule.func('test@test.com', 'email'));
      assert.isTrue(rule.func('test@test-hyphens.com', 'email'));
      assert.isTrue(rule.func('first.last@test.com', 'email'));
      assert.isTrue(rule.func('dubious.smythe-fauntleroy@test.com', 'email'));
      assert.isTrue(rule.func('test+test@test.com', 'email'));

      // sanity check:
      assert.isFalse(rule.func('test.test.com', 'email'));
      assert.isFalse(rule.func('test@test@test.com', 'email'));
      assert.isFalse(rule.func('first..last@test.com', 'email'));
      assert.isFalse(rule.func('quote"some"stuff@test.com', 'email'));
    });

    it('should validate ipv4 addresses', function () {
      assert.isTrue(rule.func('127.0.0.1', 'ipv4'));
      assert.isTrue(rule.func('2.2.2.2', 'ipv4'));

      assert.isFalse(rule.func('999.999.999.999', 'ipv4'));
      assert.isFalse(rule.func('254.254.254', 'ipv4'));
      assert.isFalse(rule.func('254.254.254.', 'ipv4'));
      assert.isFalse(rule.func('hi!', 'ipv4'));
    });

    it('should validate ipv6 addresses', function () {
      assert.isFalse(rule.func('::1', 'ipv6')); // you're going to have to spell it out :(
      assert.isTrue(rule.func('0:0:0:0:0:0:0:1', 'ipv6'));
      assert.isTrue(rule.func('2001:0db8:85a3:0000:0000:8a2e:0370:7334', 'ipv6'));

      assert.isFalse(rule.func('2001:0db8:85a3:0000:0000:8a2e:0370', 'ipv6'));
      assert.isFalse(rule.func('2001:0db8:85a3:0000:0000:8a2e:0370:', 'ipv6'));
      assert.isFalse(rule.func('20010101:0db8:85a3:0000:0000:8a2e:0370:7334', 'ipv6'));
      assert.isFalse(rule.func('qqqq:0db8:85a3:0000:0000:8a2e:0370:7334', 'ipv6'));
      assert.isFalse(rule.func('hi!', 'ipv6'));
    });

    it('should validate hostnames', function () {
      assert.isTrue(rule.func('test.com', 'hostname'));
      assert.isTrue(rule.func('test-hyphens.com', 'hostname'));
      assert.isTrue(rule.func('q.local', 'hostname'));
      assert.isTrue(rule.func('subdomain.test.com', 'hostname'));
      assert.isTrue(rule.func('test', 'hostname'));

      assert.isFalse(rule.func(new Array(257).join('a'), 'hostname'));  // 257 is intentional, resulting length is 256
      assert.isFalse(rule.func('üñîçøðé.test.com', 'hostname'));
      assert.isFalse(rule.func('under_score.com', 'hostname'));
      assert.isFalse(rule.func('-test.com', 'hostname'));
      assert.isFalse(rule.func('test-.com', 'hostname'));
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

  describe('present', function () {
    var rule = rules.present;

    it('should pass values in the supplied array', function () {
      assert.isTrue(rule.func('hi', ['hi', 'hello']));
    });

    it('should fail values not in the supplied array', function () {
      assert.isFalse(rule.func('hi', ['one', 'two']));
    });
  });

  describe('type', function () {
    var rule = rules.type;

    it('should validate strings only as strings', function () {
      assert.isTrue(rule.func('abc', 'string'));
      assert.isFalse(rule.func('abc', 'number'));
      assert.isFalse(rule.func('abc', 'object'));
      assert.isFalse(rule.func('abc', 'array'));
      assert.isFalse(rule.func('abc', 'date'));
    });

    it('should validate numbers as numbers (but also dates because technically)', function () {
      assert.isFalse(rule.func(1, 'string'));
      assert.isTrue(rule.func(1, 'number'));
      assert.isFalse(rule.func(1, 'object'));
      assert.isFalse(rule.func(1, 'array'));
      assert.isTrue(rule.func(1, 'date'));
    });

    it('should validate objects only as objects', function () {
      assert.isFalse(rule.func({field: 'value'}, 'string'));
      assert.isFalse(rule.func({field: 'value'}, 'number'));
      assert.isTrue(rule.func({field: 'value'}, 'object'));
      assert.isFalse(rule.func({field: 'value'}, 'array'));
      assert.isFalse(rule.func({field: 'value'}, 'date'));
    });

    it('should validate arrays only as arrays', function () {
      assert.isFalse(rule.func(['abc'], 'string'));
      assert.isFalse(rule.func(['abc'], 'number'));
      assert.isFalse(rule.func(['abc'], 'object'));
      assert.isTrue(rule.func(['abc'], 'array'));
      assert.isFalse(rule.func(['abc'], 'date'));
    });

    it('should validate dates as dates (but also objects because technically)', function () {
      assert.isFalse(rule.func(new Date(), 'string'));
      assert.isFalse(rule.func(new Date(), 'number'));
      assert.isTrue(rule.func(new Date(), 'object'));
      assert.isFalse(rule.func(new Date(), 'array'));
      assert.isTrue(rule.func(new Date(), 'date'));
    });
  });
});
