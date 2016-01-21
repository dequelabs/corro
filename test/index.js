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

    it('should return an empty array on success', function () {
      assert.lengthOf(new Corro().runRule({field: true}, {
        func: function (val) { return !!val; },
        message: 'message'
      }, true), 0);
    });

    it('should return the rule message on failure', function () {
      assert.deepEqual(new Corro().runRule({field: false}, {
        func: function (val) { return !!val; },
        message: 'message'
      }, false), ['message']);
    });

    it('should not execute rules without alwaysRun on null values', function () {
      assert.lengthOf(new Corro().runRule({field: null}, {
        func: function (val) { return val !== null; },
        message: 'message'
      }, null), 0);
    });

    it('should execute rules with alwaysRun on null values', function () {
      assert.deepEqual(new Corro().runRule({field: null}, {
        func: function (val) { return val !== null; },
        alwaysRun: true,
        message: 'message'
      }, null), ['message']);
    });

    it('should not execute rules without alwaysRun on undefined values', function () {
      assert.lengthOf(new Corro().runRule({}, {
        func: function (val) { return val !== undefined; },
        message: 'message'
      }), 0);
    });

    it('should execute rules with alwaysRun on undefined values', function () {
      assert.deepEqual(new Corro().runRule({}, {
        func: function (val) { return val !== undefined; },
        alwaysRun: true,
        message: 'message'
      }), ['message']);
    });

    describe('rules passed as names', function () {
      it('should be able to access runRule and the context block', function () {
        var ctx = {field: true, otherfield: 'hi'};
        var called = false;

        assert.lengthOf(new Corro({
          rule: {
            func: function (val) {
              assert.isFunction(this.runRule);
              assert.deepEqual(this.context, ctx);
              called = true;

              return !!val;
            },
            message: 'message'
          }
        }).runRule(ctx, 'rule', true), 0);

        assert.isTrue(called);
      });

      it('should pass the relevant portion of the supplied schema as args', function () {
        var called = false;

        assert.lengthOf(new Corro({
          rule: {
            func: function (val, len) {
              assert.equal(val, 'this is longer than ten characters');
              assert.equal(len, 10);
              called = true;

              return val.length > len;
            },
            message: 'message'
          }
        }).runRule({field: 'this is longer than ten characters'}, 'rule', 'this is longer than ten characters', [10]), 0);

        assert.isTrue(called);
      });

      it('should preserve arg arrays', function () {
        var called = false;

        assert.lengthOf(new Corro({
          rule: {
            func: function (val, arr) {
              assert.isArray(arr);

              called = true;

              return arr.indexOf(val) > -1;
            },
            argArray: true,
            message: 'message'
          }
        }).runRule({field: 'hi'}, 'rule', 'hi',['hi', 'hello']), 0);

        assert.isTrue(called);
      });

      it('should interpolate args into messages', function () {
        assert.equal(new Corro({
          rule: {
            func: function (val, len) { return val.length > len; },
            message: 'must be longer than {0} characters'
          }
        }).runRule({field: 'hi'}, 'rule', 'hi', [10]), 'must be longer than 10 characters');
      });

      it('should not run rules that don\'t exist', function () {
        assert.deepEqual(new Corro().runRule({}, 'slithy', 'test', 'field'), ['invalid rule specified']);
      });
    });

    describe('rules passed as blocks', function () {
      it('should be able to access runRule and the context block', function () {
        var ctx = {field: true, otherfield: 'hi'};
        var called = false;

        assert.lengthOf(new Corro().runRule(
          ctx,
          {
            func: function (val) {
              assert.isFunction(this.runRule);
              assert.deepEqual(this.context, ctx);
              called = true;

              return !!val;
            },
            message: 'message'
          },
          true), 0);

        assert.isTrue(called);
      });
    });
  });

  describe('evaluateObject', function () {
    it('should be a function', function () {
      assert.isFunction(new Corro().evaluateObject);
    });

    it('should return an empty object if all rules pass', function () {
      var errors = new Corro().evaluateObject({field: 'value'}, {required: true}, 'value', 'field');

      assert.lengthOf(Object.keys(errors), 0);
    });

    it('should return an object with field errors if rules fail', function () {
      var errors = new Corro().evaluateObject({field: null}, {required: true}, null, 'field');

      assert.lengthOf(Object.keys(errors), 1);
      assert.equal(errors.field[0].rule, 'required');
      assert.equal(errors.field[0].result, 'is required');
    });

    it('should not execute rules with args=false', function () {
      var errors = new Corro().evaluateObject({field: null}, {required: false}, null, 'field');

      assert.lengthOf(Object.keys(errors), 0);
    });

    it('should explode multiple result messages', function () {
      var errors = new Corro().evaluateObject({field: 'test'}, {
        conform: [{
          func: function (val) { return val !== 'test'; },
          message: 'one'
        }, {
          func: function (val) { return val !== 'test'; },
          message: 'two'
        }]
      }, 'test', 'field');

      assert.lengthOf(errors.field, 2);
      assert.equal(errors.field[0].rule, 'conform-0');
      assert.equal(errors.field[0].result, 'one');
      assert.equal(errors.field[1].rule, 'conform-1');
      assert.equal(errors.field[1].result, 'two');
    });

    it('should only include args in result if the rule allows it', function () {
        var result = new Corro({
          rule: {
            func: function (val, len) {
              return val.length > len;
            },
            message: 'message',
            includeArgs: false
          }
        }).evaluateObject(
          {field: 'not 10'},
          {rule: [10]},
          'not 10',
          'field');

        assert.lengthOf(result.field, 1);
        assert.isUndefined(result.field[0].args);
    });

    it('should let you evaluate rules on the root schema if you\'re willing to accept the consequences', function () {
      var result = new Corro().evaluateObject(
        {field1: [], field2: []},
        {
          conform: [{
            func: function (val) { return val.field1.length > 0 || val.field2.length > 0; },
            message: 'snail hatin'}
          ]
        },
        {field1: [], field2: []});

      assert.equal(result['undefined'][0].result, 'snail hatin');
    });

    describe('recursion into object trees', function () {
      it('should validate nested objects', function () {
        var errors = new Corro().evaluateObject(
          {obj: {field: 'value'}},
          {
            obj: {
              required: true,
              field: {
                required: true
              }
            }
          },
          {obj: {field: 'value'}}); // no key because we're simulating a top-level parent

        assert.lengthOf(Object.keys(errors), 0);
      });

      it('should return an error if a problem is found deeper in the tree', function () {
        var errors = new Corro().evaluateObject(
          {parent: {obj: {}}},
          {
            parent: {
              obj: {
                field: {
                  required: true
                }
              }
            }
          },
          {parent: {obj: {}}}); // no key because we're simulating a top-level parent

        assert.lengthOf(Object.keys(errors), 1);
        assert.isOk(errors['parent.obj.field']);
      });

      it('should abort gracefully for nulls', function () {
        var errors = new Corro().evaluateObject(
          {obj: null},
          {
            obj: {
              field: {
                minLength: 10
              }
            }
          },
          {obj: null}); // no key because we're simulating a top-level parent

        assert.lengthOf(Object.keys(errors), 0);
      });

      it('should abort as gracefully as possible for wrong types', function () {
        var errors = new Corro().evaluateObject(
          {obj: 'stop here'},
          {
            obj: {
              field: {
                subfield: {
                  required: true
                }
              }
            }
          },
          {obj: 'stop here'}); // no key because we're simulating a top-level parent

        assert.lengthOf(Object.keys(errors), 0);
      });

      it('will return errors if an immediate property of a wrong-typed object triggers an error', function () {
        var errors = new Corro().evaluateObject(
          {obj: 'stop here'},
          {
            obj: {
              field: {
                required: true,
                subfield: {
                  required: true
                }
              }
            }
          },
          {obj: 'stop here'}); // no key because we're simulating a top-level parent

        assert.lengthOf(Object.keys(errors), 1);
      });
    });

    describe('recursion into array elements', function () {
      it('should pass arrays where all simple values conform', function () {
        var errors = new Corro().evaluateObject(
          {array: ['one', 'two']},
          {
            array: {
              required: true,
              values: {required: true}
            }
          },
          {array: ['one', 'two']});

        assert.lengthOf(Object.keys(errors), 0);
      });

      it('should pass arrays where all complex values conform', function () {
        var errors = new Corro().evaluateObject(
          {array: [{field: 'value'}]},
          {
            array: {
              required: true,
              values: {
                required: true,
                field: {
                  required: true
                }
              }
            }
          },
          {array: [{field: 'value'}]});

        assert.lengthOf(Object.keys(errors), 0);
      });

      it('should fail individual nonconforming elements', function () {
        var errors = new Corro().evaluateObject(
          {array: ['one', 'two', null]},
          {
            array: {
              required: true,
              values: {required: true}
            }
          },
          {array: ['one', 'two', null]});

        assert.lengthOf(Object.keys(errors), 1);
        assert.isOk(errors['array.2']);
      });

      it('should fail individual nonconforming complex elements', function () {
        var errors = new Corro().evaluateObject(
          {array: [{notfield: 'value'}]},
          {
            array: {
              required: true,
              values: {
                required: true,
                field: {
                  required: true
                }
              }
            }
          },
          {array: [{notfield: 'value'}]});

        assert.lengthOf(Object.keys(errors), 1);
        assert.isOk(errors['array.0.field'], 1);
      });

      it('should abort gracefully for nulls', function () {
        var errors = new Corro().evaluateObject(
          {array: null},
          {
            array: {
              values: {required: true}  // kind of a weird way of saying this array may not contain null/undefined
            }
          },
          {array: null});

        assert.lengthOf(Object.keys(errors), 0);
      });

      it('should abort as gracefully as possible for wrong types', function () {
        var errors = new Corro().evaluateObject(
          {array: 'this is not an array'},
          {
            array: {
              values: {
                field: {required: true}
              }
            }
          },
          {array: 'this is not an array'});

        assert.lengthOf(Object.keys(errors), 0);
      });

      it('will return errors if an immediate property of a wrong-typed object triggers an error', function () {
        var errors = new Corro().evaluateObject(
          {array: 'this is not an array'},
          {
            array: {
              values: {
                required: true,
                field: {required: true}
              }
            }
          },
          {array: 'this is not an array'});

        assert.lengthOf(Object.keys(errors), 1);
      });

      it('will evaluate multiple element subschemata if provided', function () {
        var result = new Corro().evaluateObject(
          {array: ['one', 'two', 'three']},
          {
            array: {
              required: true,
              values: {minLength: 10},  // nothing passes this
              values2: {maxLength: 4}   // 'one' and 'two' pass, 'three' doesn't
            }
          },
          {array: ['one', 'two', 'three']});

        assert.deepEqual(result, {
          'array.0': [ { rule: 'minLength', result: 'is too short', args: 10 } ],
          'array.1': [ { rule: 'minLength', result: 'is too short', args: 10 } ],
          'array.2': [
            { rule: 'minLength', result: 'is too short', args: 10 },
            { rule: 'maxLength', result: 'is too long', args: 4 }
          ]
        });
      });
    });
	});

  describe('validate', function () {
    it('should be a function', function () {
      assert.isFunction(new Corro().validate);
    });

    it('should return a passing validation result for empty schema and object', function () {
      var result = new Corro().validate({}, {});

      assert.isTrue(result.valid);
      assert.lengthOf(Object.keys(result.errors), 0);
    });

    it('should return a passing validation result', function () {
      var result = new Corro().validate({field: {required: true}}, {field: 'value'});

      assert.isTrue(result.valid);
      assert.lengthOf(Object.keys(result.errors), 0);
    });

    it('should return a failing validation result', function () {
      var result = new Corro().validate({field: {required: true}}, {notfield: 'value'});

      assert.isFalse(result.valid);
      assert.lengthOf(Object.keys(result.errors), 1);
      assert.isOk(result.errors.field);
    });

    it('should run the example and fail', function () {
      var corro = new Corro();
      var results = corro.validate({
          username: {
            required: true,     // must not be null or undefined
            notEmpty: true,     // must not be empty or whitespace
            minLength: 4,       // must be at least 4 characters long
            maxLength: 20,      // must not be more than 20 characters long
            match: /^[^\s]+$/   // must not contain any whitespace
          }, password: {
            required: true,
            minLength: 8,
            equals: 'confirm',  // must equal the value of the other named field
          }, email: {
            required: true,
            notEmpty: true,
            format: 'email'     // must match a defined email format
          }, bio: {
            type: 'string',     // if supplied, must be a string
            conform: [{         // runs all supplied functions
              func: function (bio) {
                return bio.indexOf('innovation') > 0;
              },
              message: 'not sufficiently disruptive to extant paradigms'
            }]
          }, scores: {
            type: 'array',      // if supplied, must be an array
            minLength: 3,       // if supplied, must contain 3 or more items
            values: {           // see note about array handling
              key: {
                required: true,
                notEmpty: true,
                present: [      // must be a member of supplied array
                  'test 1',
                  'test 2',
                  'test 3'
                ]
              }, value: {
                type: 'number', // must be a number
                min: 0,         // must be greater than or equal to 0
                max: 100        // must be less than or equal to 100
              }
            }
          }
        }, {
          username: '',
          password: 'supersecure',
          confirm: 'stuporsickyear',
          email: 'test',
          bio: 'hello this is my bio',
          scores: [{key: 'a test'}]
        });

      assert.deepEqual(results, {
        valid: false,
        errors: {
          username: [{
              rule: 'notEmpty',
              result: 'cannot be blank'
            }, {
              rule: 'minLength',
              result: 'is too short',
              args: 4
            }, {
              rule: 'match',
              result: 'does not match supplied pattern'
            }],
          password: [{
              rule: 'equals',
              result: 'values are not equal',
              args: 'confirm'
          }],
          email: [{
              rule: 'format',
              result: 'expected format email',
              args: 'email'
            }],
          bio: [{
              rule: 'conform',
              result: 'not sufficiently disruptive to extant paradigms'
            }],
          scores: [{
              rule: 'minLength',
              result: 'is too short',
              args: 3
            }],
          'scores.0.key': [{
              rule: 'present',
              result: 'not in allowed values',
              args: [ 'test 1', 'test 2', 'test 3' ]
            }]
        }
      });
    });

    it('should run the example and pass', function () {
      var corro = new Corro();
      var results = corro.validate({
          username: {
            required: true,     // must not be null or undefined
            notEmpty: true,     // must not be empty or whitespace
            minLength: 4,       // must be at least 4 characters long
            maxLength: 20,      // must not be more than 20 characters long
            match: /^[^\s]+$/   // must not contain any whitespace
          }, password: {
            required: true,
            minLength: 8,
            equals: 'confirm',  // must equal the value of the other named field
          }, email: {
            required: true,
            notEmpty: true,
            format: 'email'     // must match a defined email format
          }, bio: {
            type: 'string',     // if supplied, must be a string
            conform: [{         // runs all supplied functions
              func: function (bio) {
                return bio.indexOf('innovation') > 0;
              },
              message: 'not sufficiently disruptive to extant paradigms'
            }]
          }, scores: {
            type: 'array',      // if supplied, must be an array
            minLength: 3,       // if supplied, must contain 3 or more items
            values: {           // see note about array handling
              key: {
                required: true,
                notEmpty: true,
                present: [      // must be a member of supplied array
                  'test 1',
                  'test 2',
                  'test 3'
                ]
              }, value: {
                type: 'number', // must be a number
                min: 0,         // must be greater than or equal to 0
                max: 100        // must be less than or equal to 100
              }
            }
          }
        }, {
          username: 'test',
          password: 'supersecure',
          confirm: 'supersecure',
          email: 'test@example.org',
          scores: [{
            key: 'test 1',
            value: 64
          }, {
            key: 'test 2',
            value: 62
          }, {
            key: 'test 3',
            value: 60
          }]
        });

      assert.deepEqual(results, {
        valid: true,
        errors: {}
      });
    });
  });
});
