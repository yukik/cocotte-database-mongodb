'use strict';

var Mongo = require('..');
var db = new Mongo();

db.on('openning', function () {console.log('openning');});
db.on('opened', function () {console.log('opened');});
db.on('closing', function () {console.log('closing');});
db.on('closed', function () {console.log('closed');});
db.on('actived', function () {console.log('actived');});
db.on('disactived', function () {console.log('disactived');});

// 追加
db.add('testdb', {name: 'foo'})(function (err) {
  if (err) {throw err;}

  // 更新
  db.update('testdb', {name: 'foo'}, {score: 50})(function (err){
    if (err) {throw err;}

    // 取得
    db.getRow('testdb', {name: 'foo'})(function (err, row) {
      if (err) {throw err;}

      // 削除
      db.remove('testdb', row)(function(err){
        if (err) {throw err;}

        // テーブル一覧
        db.getTables()(function (err, names) {
          if (err) {throw err;}

          // テーブル削除
          db.dropTable('testdb')(function (err) {
            if (err) {throw err;}

          }); // テーブル削除の閉じ
          
        }); // テーブル一覧の閉じ
        
      }); // 削除の閉じ

    }); // 取得の閉じ

  }); // 更新の閉じ

}); // 追加の閉じ
