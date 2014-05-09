'use strict';

/**
 * フィールド
 * @method fieldsParse
 * @param  {String|Array} fields
 * @return {Object}
 */
var fieldsParse = function fieldsParse(fields) {

  if (typeof fields === 'string') {
    fields = fields.split(',').map(function(f) {return f.trim();});
  }

  if (!Array.isArray(fields)) {
    return null;
  }

  var rtn = {};
  fields.forEach(function(f) {
    if (f !== 'rowId') {
      rtn[f] = 1;
    }
  });
  return rtn;
};

module.exports = exports = fieldsParse;