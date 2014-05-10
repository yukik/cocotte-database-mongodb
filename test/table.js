'use strict';

var Mongo = require('..');
var assert = require('assert');
var co = require('co');

var mongo = new Mongo();

mongo.on('openning', function () {console.log('openning');});
mongo.on('opened', function () {console.log('opened');});
mongo.on('closing', function () {console.log('closing');});
mongo.on('closed', function () {console.log('closed');});
mongo.on('actived', function () {console.log('actived');});
mongo.on('disactived', function () {console.log('disactived');});

co(function*(){

  var result;

  // 準備
  result = yield mongo.dropTable('testdb', {ifExists: true});

  // テーブル一覧
  result = yield mongo.getTables();
  assert(Array.isArray(result));
  assert(!~result.indexOf('testdb'));

  // // テーブル作成 常に失敗
  // result = yield mongo.createTable('testdb', {name: String});
  // assert(result === false);


  yield mongo.add('testdb', {name: 'foo'});

  // // 削除
  // result = yield mongo.dropTable('testdb');
  // assert(result === true);


  // result = yield mongo.getTables();
  // assert(!~result.indexOf('testdb'));

})();

