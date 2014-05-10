'use strict';

var Mongo = require('..');
var db = new Mongo();
var co = require('co');

db.on('openning', function () {console.log('openning');});
db.on('opened', function () {console.log('opened');});
db.on('closing', function () {console.log('closing');});
db.on('closed', function () {console.log('closed');});
db.on('actived', function () {console.log('actived');});
db.on('disactived', function () {console.log('disactived');});

co(function*(){

  var tableName = 'testdb';

  // インデックスの追加
  console.log(yield db.addIndex(tableName, 'name', {ifExists: true}));

  // ユニークインデックスの追加
  console.log(yield db.addIndex(tableName, 'loginId', {unique: true}));

  // インデックス一覧
  console.log(yield db.getIndexes(tableName));

  // インデックスの削除
  console.log(yield db.removeIndex(tableName, 'name', {ifExists: true}));

  // インデックス一覧
  console.log(yield db.getIndexes(tableName));

})();
