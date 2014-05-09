'use strict';

var co = require('co');
var Mongo = require('../mongodb');
var db = new Mongo();

co(function*(){

  // テーブル一覧
  console.log(yield db.getTables());

  // テーブル削除
  console.log(yield db.dropTable('testdb', {ifExists: true}));

})();
