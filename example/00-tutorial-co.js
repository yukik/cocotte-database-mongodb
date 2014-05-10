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

  // 追加
  yield db.add('testdb', {name: 'foo'});

  // 更新
  yield db.update('testdb', {name: 'foo'}, {score: 50});

  // 取得
  var row = yield db.getRow('testdb', {name: 'foo'});

  // 削除
  db.remove('testdb', row);

  // テーブル一覧
  var names = db.getTables();

  // テーブル削除
  db.dropTable('testdb');

})();