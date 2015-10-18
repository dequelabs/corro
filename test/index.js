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
      assert.lengthOf(Object.keys(result.errors), 0);
    });

    it('should pass if all rules pass', function () {
      var result = Corro.validate({
        field: {required: true}
      }, {
        field: 'value'
      });

      assert.isTrue(result.valid);
      assert.lengthOf(Object.keys(result.errors), 0);
    });

    it('should return errors if rules fail', function () {
      var result = Corro.validate({
        field: {required: true}
      }, {});

      assert.isFalse(result.valid);
      assert.lengthOf(Object.keys(result.errors), 1);
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
              required: true,
              subfield: {
                required: true
              }
            }
          }
        }, {obj: {field: {}}});

        assert.isFalse(result.valid);
        assert.lengthOf(Object.keys(result.errors), 1);
        assert.isOk(result.errors['obj.field.subfield']);
      });

      it('should stop gracefully and fail for nulls', function () {
        assert.isFalse(Corro.validate({
          obj: {
            required: true,
            field: {
              required: true
            }
          }
        }, {obj: null}).valid);
      });

      it('should stop gracefully and fail for wrong types', function () {
        assert.isFalse(Corro.validate({
          obj: {
            required: true,
            field: {
              required: true
            }
          }
        }, {obj: 'good luck walking down this'}).valid);
      });
    });

    describe('recursion into array elements', function () {
      it('should validate objects in arrays', function () {
        var result = Corro.validate({
          array: {
            required: true,
            // minLength: 5, etc
            values: {required: true}
          }
        }, {array: ['one', 'two', null]});

        assert.isFalse(result.valid);
        assert.lengthOf(result.errors['array.2'], 1);
      });

      it('should stop gracefully and fail for nulls', function () {
        var result = Corro.validate({
          array: {
            required: true,
            // minLength: 5, etc
            values: {required: true}
          }
        }, {array: null});

        assert.isFalse(result.valid);
        assert.lengthOf(result.errors.array, 1);
      });

      it('should stop gracefully and fail for wrong types', function () {
        var result = Corro.validate({
          array: {
            required: true,
            // minLength: 5, etc
            values: {required: true}
          }
        }, {array: 'this is not an array'});

        assert.isFalse(result.valid);
        assert.lengthOf(result.errors['array.values'], 1);
      });
    });
	});
});
