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

  // 存在しない場合は空の配列を返す
  var indexes = yield db.getIndexes(tableName, {ifExists: true});
  console.log(indexes);

  try{

    indexes = yield db.getIndexes(tableName);
    console.log(indexes);

  } catch(e){
    console.error(e);

  }

  



})();

