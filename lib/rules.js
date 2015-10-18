'use strict';

exports = module.exports = {
  'required': {
    func: function (val) { return val !== null && val !== undefined; },
    message: 'is required'
  },
  'minLength': {
    func: function (val, len) { return !val || (val.hasOwnProperty('length') && val.length >= len); },
    message: 'is too short'
  }
};
