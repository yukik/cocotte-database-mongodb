'use strict';

var Mongo = require('../mongodb');
var db = new Mongo();


// 追加
db.add('testdb', {name: 'foo'})(function (err) {

  if (err) {
    throw err;
  }

  // 更新
  db.update('testdb', {name: 'foo'}, {score: 50})(function (err){

    if (err) {
      throw err;
    }

    // 取得
    db.find('testdb', {name: 'foo'})(function (err, data) {

      if (err) {
        throw err;
      }

      console.log(data);

      // 削除
      db.remove('testdb', {name: 'foo'})(function(err){
        if (err) {
          throw err;
        }

        // テーブル一覧
        db.getTables()(function (err, names) {

          if (err) {
            throw err;
          }

          console.log(names);

          // テーブル削除
          db.dropTable('testdb')(function (err) {

            if (err) {
              throw err;
            }

          }); // テーブル削除の閉じ
          
        }); // テーブル一覧の閉じ
        
      }); // 削除の閉じ

    }); // 取得の閉じ

  }); // 更新の閉じ

}); // 追加の閉じ
