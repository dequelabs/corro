'use strict';

var assert = require('chai').assert;
var Corro = require('../index.js');

describe('Corro', function () {
  describe('validate', function () {
    it('should be a function', function () {
      assert.isFunction(Corro.validate);
    });

    it('should return a validation result', function () {
      var result = Corro.validate({}, {});

      assert.isTrue(result.valid);
      assert.lengthOf(result.errors, 0);
    });

    it('should pass if all rules pass', function () {
      var result = Corro.validate({
        field: {required: true}
      }, {
        field: 'value'
      });

      assert.isTrue(result.valid);
      assert.lengthOf(result.errors, 0);
    });

    it('should return errors if rules fail', function () {
      var result = Corro.validate({
        field: {required: true}
      }, {});

      assert.isFalse(result.valid);
      assert.lengthOf(result.errors, 1);
    });

    describe('recursion into object trees', function () {
      it('should validate nested objects', function () {
        assert.isTrue(Corro.validate({
          obj: {
            required: true,
            field: {
              required: true
            }
          }
        }, {obj: {field: 'value'}}).valid);
      });

      it('should return an error if a problem is found deeper in the tree', function () {
        var result = Corro.validate({
          obj: {
            required: true,
            field: {
              required: true
            }
          }
        }, {obj: {}});

        assert.isFalse(result.valid);
        assert.lengthOf(result.errors, 1);
        assert.isNotNull(result.errors['obj.field']);
      });

      it('should stop gracefully for nulls', function () {
        assert.isTrue(Corro.validate({
          obj: {
            required: true,
            field: {
              required: true
            }
          }
        }, {obj: null}).valid);
      });

      it('should stop gracefully for wrong types', function () {
        assert.isTrue(Corro.validate({
          obj: {
            required: true,
            field: {
              required: true
            }
          }
        }, {obj: 'good luck walking down this'}).valid);
      });
    });
	});
});
