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

  /**
   * 初期化
   */
  yield db.dropTable(tableName, {ifExists: true});

  /**
   * createTableを実行してもテーブルは作成されません
   * 同名のテーブルを指定すると例外が発生します
   */
  var schema = {name: String};
  yield db.createTable(tableName, schema);

  /**
   * 実際のテーブル作成は行追加で自動的にテーブルが作成されます
   */
  yield db.add(tableName, {name: 'foo'});

  /**
   * テーブル一覧
   */
  console.log(yield db.getTables());

})();

