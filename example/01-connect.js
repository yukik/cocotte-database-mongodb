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

  /**
   * 接続
   *
   * 明示して接続を行う事は出来るがクエリ時に自動接続するため
   * ほとんどの場合は必要ない
   */
  yield db.open();

  /**
   * 切断
   *
   * 明示して切断を行う事は出来るがアイドル状態になると自動的に切断されるため
   * ほとんどの場合は必要ない
   */
  yield db.close();

})();
