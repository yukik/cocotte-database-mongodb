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


  var success;

  /**
   * フィールドの追加は実行されません
   * (必要ありません)
   */
  success = yield db.addField(tableName, 'field1', {type: String}, {ifExists: true});
  console.log('addField:' + success);

  /**
   * フィールドの変更は実行されません
   * (必要ありません)
   */
  success = yield db.alterField(tableName, 'field1', {type: String}, {ifExists: true});
  console.log('alterField:' + success);

  /**
   * フィールドの削除は実行されません
   * (必要ありません)
   */
  success = yield db.removeField(tableName, 'field1', {ifExists: true});
  console.log('removeField:' + success);



})();

