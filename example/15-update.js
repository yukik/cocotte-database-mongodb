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

  var tableName = 'testdb1';

  var effecRowCount = yield db.update(tableName, {score:100}, {memo: 'great'});
  console.log(effecRowCount);

  // var rows = yield db.find(tableName, {score: 100});
  // console.log(rows);

})();

