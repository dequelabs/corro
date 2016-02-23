'use strict';

var assert = require('chai').assert;
var Corro = require('../../../index.js');
var rule = require('../../../lib/rules/conform.js');

describe('conform', function () {
  var ctx = {runRule: new Corro().runRule};

  it('should not include arguments in the result', function () {
    assert.isFalse(rule.includeArgs);
  });

  it('should pass values passed by dependent rules', function () {
    assert.isTrue(rule.apply(ctx, [
      'test',
      {
        func: function (val) { return val === 'test'; },
        message: 'dummy'
      }
    ]));
  });

  it('should fail values failed by dependent rules', function () {
    assert.deepEqual(rule.apply(ctx, [
      'test',
      {
        func: function (val) { return val !== 'test'; },
        message: 'this should be in an array'
      }]), ['this should be in an array']);
  });

  it('should compile a litany of failures', function () {
    assert.deepEqual(rule.apply(ctx, [
      'test',
      {
        func: function (val) { return val !== 'test'; },
        message: 'one'
      }, {
        func: function (val) { return val === 'no'; },
        message: 'two'
      }]), ['one', 'two']);
  });

  it('should exclude messages from successful dependent rules', function () {
    assert.deepEqual(rule.apply(ctx, [
      'test',
      {
        func: function (val) { return val === 'test'; },
        message: 'one'
      }, {
        func: function (val) { return val === 'no'; },
        message: 'two'
      }]), ['two']);
  });

  it('should pass the context to dependent rules', function () {
    var called = false;

    ctx.context = {
      field: 'test',
      otherfield: 'hello'
    };

    assert.isTrue(rule.apply(ctx, [
      'test',
      {
        func: function (val) {
          assert.deepEqual(this.context, ctx.context);
          called = true;

          return val === 'test';
        },
        message: 'dummy'
      }
    ]));

    assert.isTrue(called);
  });
});
