# Corro
[![Build Status](https://travis-ci.org/dmfay/corro.svg?branch=master)](https://travis-ci.org/dmfay/corro)

Corro is a powerful, extensible validation framework for node.js.

<!-- TOC depth:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Corro](#corro)
	- [Installation](#installation)
	- [Usage/Example](#usageexample)
	- [Rules](#rules)
	- [Built-In Rules](#built-in-rules)
		- [conform](#conform)
		- [extension](#extension)
		- [format](#format)
		- [match](#match)
		- [max/min](#maxmin)
		- [maxLength/minLength](#maxlengthminlength)
		- [notEmpty](#notempty)
		- [present](#present)
		- [required](#required)
		- [type](#type)
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
    email: 'test@example.org'
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
  "email": "test",
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
        "rule": "present",
        "result": "not in allowed values",
        "args": [ "test 1", "test 2", "test 3" ]
      }]
  }
}
```

### Notes
#### Arrays
Any key-value pair in a schema where the value is a plain Object is taken to
represent a nested value in the validating document -- it's how "scores" is
distinguished from a hypothetical rule named "scores" in the example above.
This works out sensibly enough for nested objects, but for arrays it's a little
weird.

Values representing arrays of objects must contain **only one** non-rule object
definition. If multiple such definitions are present, Corro will be unable to
infer which it should use in order to validate the members of the array and so
will simply add a validation error to that effect.

## Rules
Corro ships with a small but flexible set of rules, and you can extend it with
your own by passing a rule object into the constructor. If one of your rules has
the same name as a built-in rule, your version will take precedence.

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

**alwaysRun**: True to evaluate even null and undefined values, which are
  otherwise skipped.

**argArray**: True if you don't want the executor to break up your schema args
  when it invokes your function, and instead want a single argument array to be
  passed in.

**includeArgs**: By default, schema args are included in the results object to
  allow custom interpolation after validation. If includeArgs is both present
  and false, the schema args will not be included.

## Built-In Rules
Checking the `lib/rules` testcases for more in-depth documentation is highly
recommended.

### conform
Runs any number of custom rule functions against the value and compiles the
results. Each member of the functions array must be a rule block as specified
above. Failures will be indexed by their position in the rule array, so for
example if the second rule fails the final result will be recorded as
'conform-1'.

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

### notEmpty
Ensures that the value (strings only) is not empty or only whitespace.

### present
Verifies that the value is present in the supplied array.

### required
Validates that the value is neither `null` nor `undefined`.

### type
Checks that the value's type matches one of the following lowercase specifiers:
* **array**
* **object**
* **string**
* **number**
* **date**

## Contributions
This is a spare-time project so I can't promise immediate feedback, but issues and especially pull requests are welcome!

## Acknowledgements
I'd be remiss if I didn't at least mention revalidator, which inspired a lot of the general approach to Corro.
