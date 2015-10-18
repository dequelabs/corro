'use strict';

exports = module.exports = {
  'required': {
    func: function (val) { return !!val; },
    message: 'is required'
  },
  'minLength': {
    func: function (val, len) { return val && val.length >= len; },
    message: 'is too short'
  }
};
