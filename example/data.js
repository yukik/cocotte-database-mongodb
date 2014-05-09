'use strict';

var co = require('co');
var Mongo = require('../mongodb');
var db = new Mongo();

co(function*(){

  // 新規行番号を取得
  var rowId = yield db.createId();

  // 追加
  var result = yield db.upsert('testdb', {rowId: rowId, name: 'foo', score: 50});
  console.log(result);

  // 取得
  var row = yield db.getRow('testdb', rowId);
  console.log(row);

  // 更新
  row.score = 70;
  result = yield db.upsert('testdb', row);
  console.log(result);

  // 取得
  row = yield db.getRow('testdb', rowId);
  console.log(row);

  // 追加
  rowId = yield db.add('testdb', {name: 'bar', score: 90});
  console.log(rowId);

  // 取得
  var rows = yield db.find('testdb');
  console.log(rows);

  // 削除
  result = yield db.remove('testdb');
  console.log(result);
})();
