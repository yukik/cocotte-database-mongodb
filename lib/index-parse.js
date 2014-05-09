'use strict';

var cis = require('cocotte-is');

/**
 * インデックスを設定できる配列に変更する
 * 設定出来ない場合はnullを返す
 *
 * 'name' -> [['name', 1]]
 * '-name' -> [['name', -1]]
 * 'name-' -> [['name', -1]]
 * 'name, age' -> [['name', 1], ['age', 1]]
 * 'name, -age' -> [['name', 1], ['age', -1]]
 * ['name', 'age'] -> [['name', 1], ['age', 1]]
 * ['name', ['age', 'desc']] -> [['name', 1], ['age', -1]]
 * 
 * @method indexesParse
 * @param  {String|Array}     fields
 * @return {Object}
 */
var indexesParse = function indexesParse (fields) {

  if (cis(String, fields)) {
    fields = fields.split(',').map(function(v){
      return v.trim();
    });
  }

  if (!cis(Array, fields)) {
    return null;
  }

  var indexes = [];
  fields.forEach(function(f) {

    if (cis(String, f)) {
      indexes.push(toIdx(f));

    } else if (cis(Array, f) && cis(String, f[0])) {
      var asc = f[1] === -1 || f[1] === false || f[1] === 'desc' ? -1 : 1;
      indexes.push([f[0], asc]);

    }

  });

  return indexes;
};

var toIdx = function toIdx(field) {

  if (field.indexOf('-') === 0) {
    return [field.substring(1), -1];

  } else if (field.lastIndexOf('-') === field.length - 1) {
    return [field.substring(0, field.length - 1), -1];

  } else {
    return [field, 1];

  }
};

module.exports = exports = indexesParse;

