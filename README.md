# Corro
[![Build Status](https://travis-ci.org/dmfay/corro.svg?branch=master)](https://travis-ci.org/dmfay/corro)

Corro is a powerful, extensible validation framework for node.js.

<!-- TOC depth:6 withLinks:1 updateOnSave:0 orderedList:0 -->

- [Corro](#corro)
  - [Installation](#installation)
  - [Usage/Example](#usageexample)
    - [Notes](#notes)
      - [Skipping Execution](#skipping-execution)
      - [Arrays](#arrays)
      - [Evaluating the Root Context](#evaluating-the-root-context)
  - [Rules](#rules)
  - [Built-In Rules](#built-in-rules)
    - [any/none](#anynone)
    - [anyField](#anyfield)
    - [conform](#conform)
    - [equals](#equals)
    - [extension](#extension)
    - [format](#format)
    - [match](#match)
    - [max/min](#maxmin)
    - [maxLength/minLength](#maxlengthminlength)
    - [notDefined](#notdefined)
    - [notEmpty](#notempty)
    - [required](#required)
    - [type](#type)
    - [value](#value)
  - [Contributions](#contributions)
  - [Acknowledgements](#acknowledgements)

<!-- /TOC -->

## Installation
Via NPM: `npm install corro`

## Usage/Example

Instantiate Corro and pass a schema and document to `validate()`.

```javascript
var Corro = require('corro');
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
          any: [          // must be a member of supplied array
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
    }, terms: {
      required: true,
      value: 'yes'        // if present, must be 'yes'
    }
  }, {
    username: 'test',
    password: 'supersecure',
    confirm: 'supersecure',
    email: 'test@example.org',
    terms: 'yes',
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
```

The output is a JSON object; since the document above passes validation, it's

```JSON
{ "valid": true, "errors": {} }
```

If we pass something that fails, such as
```JSON
{
  "username": "",
  "password": "supersecure",
  "confirm": "stuporsickyear",
  "email": "test",
  "terms": "no",
  "bio": "hello this is my bio",
  "scores": [{"key": "a test"}]
}
```

we get a more interesting result:

```JSON
{
  "valid": false,
  "errors": {
    "username": [{
        "rule": "notEmpty",
        "result": "cannot be blank"
      }, {
        "rule": "minLength",
        "result": "is too short",
        "args": 4
      }, {
        "rule": "match",
        "result": "does not match supplied pattern"
      }],
    "password": [{
        "rule": "equals",
        "result": "values are not equal",
        "args": "confirm"
    }],
    "email": [{
        "rule": "format",
        "result": "expected format email",
        "args": "email"
      }],
    "bio": [{
        "rule": "conform",
        "result": "not sufficiently disruptive to extant paradigms"
      }],
    "scores": [{
        "rule": "minLength",
        "result": "is too short",
        "args": 3
      }],
    "scores.0.key": [{
        "rule": "any",
        "result": "not in allowed values",
        "args": [ "test 1", "test 2", "test 3" ]
      }],
    "terms": [{
        "args": "yes",
        "rule": "value",
        "result": "expected yes"
    }]
  }
}
```

### Notes
#### Skipping Execution
When evaluating the schema, all rules with falsy arguments will be passed over
_unless_ they have `alwaysRun` set. This allows for conditionally or temporarily
turning rules off by setting eg `required: false` instead of `required: true`,
but also means that custom rules should generally be phrased as positive
expressions, since unless `alwaysRun` is on (which may sometimes lead to
undesirable behavior), constructions such as `allowX: false` will never execute.

Currently the only built-in rule with this setting is `value`, which needs to
test explicitly `false` values.

#### Arrays
Any key-value pair in a schema where the value is a plain Object is taken to
represent a nested value in the validating document -- it's how "scores" is
distinguished from a hypothetical rule named "scores" in the example above.
This works out sensibly enough for nested objects, but for arrays it's a little
weird.

Values representing arrays of objects should contain **only one** non-rule key
whose value represents the schema for elements in the array. There isn't
anything preventing you from passing multiple definitions, and Corro will apply
each of them in turn and safely merge the results, but it can't be recommended.

#### Evaluating the Root Context
In certain cases it may be necessary to evaluate rules on the original object
passed in -- in particular, [anyField](#anyfield) is intended to process
objects in the first place, and [conform](#conform) can do pretty much anything.
While validation messages from nested contexts are recorded against a
dot-separated path to each respective context, the original object _has_ no such
path. Corro records validation messages raised against the root context with the
key "\*".

## Rules
Corro ships with a small but flexible set of rules, and you can extend it with
your own by passing a rule object into the constructor. If one of your rules has
the same name as a built-in rule, your implementation will override the default.

The rule object is of the form `{rulename: [rule block]}`, where the rule block
contains the following fields:

**func** (required): The rule function itself. Return true for success, false
  or an array of messages for failure. The first argument will be the value
  under test; if your schema definition includes an additional arguments array,
  its contents will be passed in one by one as the remaining arguments (unless
  argArray is specified).

**message**: The default failure message. Not strictly required, but unless your
  function returns a message array it'd be a good idea. You can use `"{0}"` and
  so forth to interpolate the arguments -- note that this refers to the args
  defined in your _schema_, and that the value under test will never be
  interpolated.

**alwaysRun**: If this is true, this rule can never be turned off by setting
  `{rulename: false}` in your schema.

**argArray**: True if you don't want the executor to break up your schema args
  when it invokes your function, and instead want a single argument array to be
  passed in.

**evaluateNull**: True to execute the rule even when the value under test is
  `null`.

**evaluateUndefined**: True to execute the rule even when the value under test
  is `undefined`.

**includeArgs**: By default, schema args are included in the results object to
  allow custom interpolation after validation. If includeArgs is both present
  and false, the schema args will not be included.

## Built-In Rules
Checking the `lib/rules` testcases for more in-depth documentation is highly
recommended.

### any/none
Verifies that the value is present in (any) or absent from (none) the supplied
array.

### anyField
Given an array of field names followed by a value in the form
`['field1', 'field2', ..., 'fieldN', 'myValue']`, this rule tests the specified
fields at the current context level and only passes if at least one has the
given value.

```
new Corro().validate({
  anyField: ['field1', 'field2', 'field3', 'value']
}, {
  field1: 'one',
  field2: 'two',
  field3: 'value'
})
```

Note that this example is evaluating the rule on the root context, or the
original object passed in -- meaning that if validation were to fail, the
circumstances described in
[Evaluating the Root Context](#evaluating-the-root-context) apply.

### conform
Runs any number of custom rule functions against the value and compiles the
results. Each member of the functions array must be a rule block as specified
above. If multiple conform rules are configured, failures will be indexed by
their position in the rule array, so for example if the second rule fails the
final result will be recorded as 'conform-1'.

### equals
Checks the value against the value of the named field (at the same schema level,
if you're validating nested objects). Useful for eg password confirmation.

### extension
Ensures that the file's extension is in the provided array.

### format
Validates the value against a number of built-in regular expressions. Currently
supported formats:
* **url**
* **email**
* **ipv4**
* **ipv6**
* **hostname**
* **hostnameOrIp** (both IPv4 and IPv6 addresses pass)
* **objectId** (MongoDB ObjectId)
* **uuid**

### match
Tests the value against the supplied regular expression.

### max/min
Verifies that the value is below or above the supplied maximum or minimum
threshold.

### maxLength/minLength
Verifies that the length of the value (string or Array) is below or above the
supplied maximum or minimum threshold.

### notDefined
Tests whether the value is defined or not. Only passes `undefined` values.

### notEmpty
Ensures that the value (strings only) is not empty or only whitespace.

### required
Validates that the value is neither `null` nor `undefined`. You may supply
either `true` or the name of another field (at the same level if your schema
contains nested objects). In the latter case, the value may be null or undefined
if and only if the dependency field's value is also null or undefined.

### type
Checks that the value's type matches one of the following lowercase specifiers:
* **array**
* **object**
* **string**
* **number**
* **date**
* **json**

Some values will pass multiple type validators:
* Numbers are valid Dates and also valid JSON.
* Plain Objects are considered valid JSON.
* Dates count as Objects.
* Parseable stringified JSON obviously counts both as a string and as JSON.

### value
If present, the value must be strictly equal to the provided argument. This rule
runs even when its schema argument is `false`, which turns other rules off.

## Contributions
This is a spare-time project so I can't promise immediate feedback, but issues
and especially pull requests are welcome!

## Acknowledgements
I'd be remiss if I didn't at least mention revalidator, which inspired a lot of
the general approach to Corro.
