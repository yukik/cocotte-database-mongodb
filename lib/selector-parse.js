'use strict';

var ObjectID = require('mongodb').ObjectID;

var selectorParse = function selectorParse (selector) {

  if (!selector) {
    return {};
  }

  if (typeof selector === 'string') {
    return {_id: new ObjectID(selector)};
  }

  if (selector.rowId) {
    return {_id: new ObjectID(selector.rowId)};
  }

  return Object.keys(selector).reduce(function (x, p){
    x[p] = selector[p];
    return x;
  }, {});
};

module.exports = exports = selectorParse;