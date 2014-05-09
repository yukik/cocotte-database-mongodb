'use strict';

/**
 * 取得したインデックスを文字列の配列に変更します
 *
 * [['name', 1]] -> 'name'
 * [['name', -1]] -> '-name'
 * [['name', 1], ['age', 1]] -> 'name, age'
 * [['name', 1], ['age', -1]] -> 'name, -age'
 * 
 * @method indexesDeparse
 * @param  {Object}     indexes
 * @return {Array}
 */
var indexDeparse = function indexDeparse(indexes) {

  var idxs = [];
  if (indexes) {
    Object.keys(indexes).forEach(function(k){
      if (k !== '_id_') {
        var idx = indexes[k].reduce(function (x, f) {
          x.push(f[1] === -1 ? '-' + f[0] : f[0]);
          return x;
        }, []);
        idxs.push(idx.join(', '));
      }
    });
  }

  return idxs;
};

module.exports = exports = indexDeparse;