'use strict';

var sortParse = require('./sort-parse');

var findOptionsParse = function findOptionsParse (options, props) {

  if (!options) {
    return {};
  }

  var op = {};

  // sort
  if (~props.indexOf('sort') && options.sort) {
    op.sort = sortParse(options.sort);
  }
  // skip
  if (~props.indexOf('skip') && typeof options.skip === 'number') {
    op.skip  = options.skip;
  }
  // limit
  if (~props.indexOf('limit') && typeof options.limit === 'number') {
    op.limit = options.limit;
  }

  return op;
};

module.exports = exports = findOptionsParse;
