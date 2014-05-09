'use strict';

var compare = require('cocotte-compare');

/**
 * インデックス一覧から対象のインデックスと同じインデックス名を取得する
 * @method getIndexName
 * @param  {Array}  index
 * @param  {Object} indexes
 * @return {String}
 */
var getIndexName = function getIndexName(index, indexes) {

  var name;

  var result = Object.keys(indexes).some(function (n) {
    name = n;
    return compare(indexes[name], index);
  });

  return result ? name : null;
};

module.exports = exports = getIndexName;