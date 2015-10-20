'use strict';

var assert = require('chai').assert;
var Corro = require('../index.js');

describe('Corro', function () {
  describe('ctor', function () {
    it('should be a function', function () {
      assert.isFunction(Corro);
    });

    it('should add custom rules', function () {
      var control = new Corro();
      var c = new Corro({
        myRule: {
          func: function (val) { return typeof val === 'number' && val > 10; },
          message: 'hello!'
        }
      });

      assert.lengthOf(Object.keys(c.rules), Object.keys(control.rules).length + 1);
      assert.equal(c.rules.myRule.message, 'hello!');
    });

    it('should override existing rules if a custom rule of the same name is supplied', function () {
      var control = new Corro();
      var c = new Corro({
        required: {
          func: function (val) { return !!val; },
          message: 'hello!'
        }
      });

      assert.lengthOf(Object.keys(c.rules), Object.keys(control.rules).length);
      assert.equal(c.rules.required.message, 'hello!');
    });
  });

  describe('runRule', function () {
    it('should be a function', function () {
      assert.isFunction(new Corro().runRule);
    });

    it('should return null on success', function () {
      assert.isNull(new Corro().runRule({
        func: function (val) { return !!val; },
        message: 'message'
      }, true));
    });

    it('should return the rule message on failure', function () {
      assert.equal(new Corro().runRule({
        func: function (val) { return !!val; },
        message: 'message'
      }, false), 'message');
    });

    it('should not execute rules without alwaysRun on null values', function () {
      assert.isNull(new Corro().runRule({
        func: function (val) { return val !== null; },
        message: 'message'
      }, null));
    });

    it('should execute rules with alwaysRun on null values', function () {
      assert.equal(new Corro().runRule({
        func: function (val) { return val !== null; },
        alwaysRun: true,
        message: 'message'
      }, null), 'message');
    });

    it('should not execute rules without alwaysRun on undefined values', function () {
      assert.isNull(new Corro().runRule({
        func: function (val) { return val !== undefined; },
        message: 'message'
      }));
    });

    it('should execute rules with alwaysRun on undefined values', function () {
      assert.equal(new Corro().runRule({
        func: function (val) { return val !== undefined; },
        alwaysRun: true,
        message: 'message'
      }), 'message');
    });

    it('should pass arg values to rules', function () {
      var called = false;

      assert.isNull(new Corro().runRule({
        func: function (val, len) {
          assert.equal(val, 'this is longer than ten characters');
          assert.equal(len, 10);
          called = true;

          return val.length > len;
        },
        message: 'message'
      }, 'this is longer than ten characters', [10]));

      assert.isTrue(called);
    });

    it('should interpolate args into messages', function () {
      assert.equal(new Corro().runRule({
        func: function (val, len) { return val.length > len; },
        message: 'must be longer than {0} characters'
      }, 'hi', [10]), 'must be longer than 10 characters');
    });
  });

  describe('evaluateObject', function () {
    it('should return an empty object if all rules pass', function () {
      var errors = new Corro().evaluateObject({required: true}, 'value', 'field');

      assert.lengthOf(Object.keys(errors), 0);
    });

    it('should return an object with field errors if rules fail', function () {
      var errors = new Corro().evaluateObject({required: true}, null, 'field');

      assert.lengthOf(Object.keys(errors), 1);
    });

    describe('recursion into object trees', function () {
      it('should validate nested objects', function () {
        var errors = new Corro().evaluateObject({
          obj: {
            required: true,
            field: {
              required: true
            }
          }
        }, {obj: {field: 'value'}});

        assert.lengthOf(Object.keys(errors), 0);
      });

      it('should return an error if a problem is found deeper in the tree', function () {
        var errors = new Corro().evaluateObject({
          obj: {
            required: true,
            field: {
              required: true
            }
          }
        }, {obj: {}});

        assert.lengthOf(Object.keys(errors), 1);
        assert.isOk(errors['obj.field']);
      });

      it('should abort gracefully for nulls', function () {
        var errors = new Corro().evaluateObject({
          obj: {
            field: {
              minLength: 10
            }
          }
        }, {obj: null});

        assert.lengthOf(Object.keys(errors), 0);
      });

      it('should abort as gracefully as possible for wrong types', function () {
        var errors = new Corro().evaluateObject({
          obj: {
            field: {
              subfield: {
                required: true
              }
            }
          }
        }, {obj: 'subfield is not accessible at all'});

        assert.lengthOf(Object.keys(errors), 0);
      });

      it('will return errors if an immediate property of a wrong-typed object triggers an error', function () {
        var errors = new Corro().evaluateObject({
          obj: {
            field: {
              required: true,
              subfield: {
                required: true
              }
            }
          }
        }, {obj: 'subfield is not accessible at all'});

        assert.lengthOf(Object.keys(errors), 1);
      });
    });

    describe('recursion into array elements', function () {
      it('should pass arrays where all simple values conform', function () {
        var errors = new Corro().evaluateObject({
          array: {
            required: true,
            values: {required: true}
          }
        }, {array: ['one', 'two']});

        assert.lengthOf(Object.keys(errors), 0);
      });

      it('should pass arrays where all complex values conform', function () {
        var errors = new Corro().evaluateObject({
          array: {
            required: true,
            values: {
              required: true,
              field: {
                required: true
              }
            }
          }
        }, {array: [{field: 'value'}]});

        assert.lengthOf(Object.keys(errors), 0);
      });

      it('should fail individual nonconforming elements', function () {
        var errors = new Corro().evaluateObject({
          array: {
            required: true,
            values: {required: true}
          }
        }, {array: ['one', 'two', null]});

        assert.lengthOf(Object.keys(errors), 1);
        assert.isOk(errors['array.2'], 1);
      });

      it('should fail individual nonconforming complex elements', function () {
        var errors = new Corro().evaluateObject({
          array: {
            required: true,
            values: {
              required: true,
              field: {
                required: true
              }
            }
          }
        }, {array: [{notfield: 'value'}]});

        assert.lengthOf(Object.keys(errors), 1);
        assert.isOk(errors['array.0.field'], 1);
      });

      it('should abort gracefully for nulls', function () {
        var errors = new Corro().evaluateObject({
          array: {
            values: {required: true}  // kind of a weird way of saying this array may not contain null/undefined
          }
        }, {array: null});

        assert.lengthOf(Object.keys(errors), 0);
      });

      it('should abort as gracefully as possible for wrong types', function () {
        var errors = new Corro().evaluateObject({
          array: {
            values: {
              field: {required: true}
            }
          }
        }, {array: 'this is not an array'});

        assert.lengthOf(Object.keys(errors), 0);
      });

      it('will return errors if an immediate property of a wrong-typed object triggers an error', function () {
        var errors = new Corro().evaluateObject({
          array: {
            values: {
              required: true,
              field: {required: true}
            }
          }
        }, {array: 'this is not an array'});

        assert.lengthOf(Object.keys(errors), 1);
      });

      it('should abort and fail if multiple subschemata provided', function () {
        var result = new Corro().validate({
          array: {
            required: true,
            values: {required: true},
            values2: {required: true}
          }
        }, {array: ['one', 'two']});

        assert.isFalse(result.valid);
        assert.lengthOf(result.errors.array, 1);
      });
    });
	});

  describe('validate', function () {
    it('should be a function', function () {
      assert.isFunction(new Corro().validate);
    });

    it('should return a validation result', function () {
      var result = new Corro().validate({}, {});

      assert.isTrue(result.valid);
      assert.lengthOf(Object.keys(result.errors), 0);
    });
  });
});
