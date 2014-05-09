'use strict';

var co = require('co');
var Mongo = require('../mongodb');
var db = new Mongo();

co(function*(){

  // インデックスの追加
  console.log(yield db.addIndex('testdb', 'name'));

  // ユニークインデックスの追加
  console.log(yield db.addIndex('testdb', 'loginId', {unique: true}));

  // インデックス一覧
  console.log(yield db.getIndexes('testdb'));

  // インデックスの削除
  console.log(yield db.removeIndex('testdb', 'name', {ifExists: true}));

  // インデックス一覧
  console.log(yield db.getIndexes('testdb'));

})();
