'use strict';

var assert = require('chai').assert;
var rule = require('../../../lib/rules/extension.js');

describe('extension', function () {
  it('should have a message', function () {
    assert.equal(rule.message, 'file extension is not supported');
  });

  it('should pass filenames with a valid extension', function () {
    assert.isTrue(rule('image.jpg', ['jpg', 'gif', 'png']));
  });

  it('should fail filenames without a valid extension', function () {
    assert.isFalse(rule('image.doc', ['jpg', 'gif', 'png']));
  });
});
