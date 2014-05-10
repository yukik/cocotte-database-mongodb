cocotte-database-mongodb
========================

# はじめに

mongodbの操作を行う為のクラスを提供します。  
メソッドは、thunkを返す高次関数で作成されています。  
そのため、`co`モジュール内のジェネレータで使用する事が容易になります。  

`cocotte-database-mongodb`は`cocotte-database`のAPIに準拠したモジュールです。  
`cocotte-database`はデータベースの違いによる操作の違いを吸収するためのモジュールです。  

# 使用方法

次の例を確認してください。  
`thunk`を利用する事で、非同期処理であるデータベースの操作を簡素に記述する事が出来ます。  
もし、同じ操作を`co`とジェネレータを使用せずに行った場合にどのように記述しなければならないのかを知りたければ、
`example`ディレクトリの`00-tutorial-callback.js`で確認してください。  
おそらく大多数の方が`co`を使用したくなるでしょう。

ただし、`co`ではgeneratorを利用しています。nodeのバージョン0.11以上で`--harmony`オプションをつけて実行してください。  
`cocotte-database-mongodb`はgeneretorを利用していませんので、コールバックの記述も可能です。

```javascript
var Mongo = require('cocotte-database-mongodb');
var co = require('co');
var db = new Mongo();

co(function*(){

  // 追加
  var rowId = yield db.add('testdb', {name: 'foo'});

  // 更新
  var result = yield db.upsert('testdb', {rowId: rowId, score: 50});

  // 取得
  console.log(yield db.find('testdb', {name: 'foo'}));

  // 削除
  yield db.remove('testdb', rowId);

  // 新規行番号取得
  var newRowId = yield db.rowId();

  // 追加
  yield db.upsert('testdb', {rowId: newRowId, name: 'bar'});

})();
```

# API

APIは、`cocotte-database`で規定されたインターフェースに基づいて設計されています。  
そのためいくつかのメソッドは、動作しないものがあります。  

 > `yield`キーワードがある記述例はすべて`co`モジュールを使用していることとします。

## データベースオブジェクト

はじめにデータベースを操作する為のオブジェクトの作成を行います。

```javascript
var Mongodb = require('cocotte-database-mongodb');

var config = {
  host: '127.0.0.1', // ホスト
  port: 27017, // ポート番号
  db: 'cocotte', // 接続先データベース
  pool: 1 // コネクションプールの上限
};

var db = new Mongodb(config);
```

`config`の各値は省略時の既定値です。  
また`config`自体を書略する事も出来ます。  


## データベースへの接続

以下のように記述する事でデータベースへの接続を開始する事ができます。  
しかし記述する事はほぼ無いでしょう。  
あらゆる処理にはデータベースへの接続を自動で開始するようになっています。  
また、接続を解除する記述も必要ありません。  
データベースへのコマンドが実行されておらずアイドリング状態になると自動的に接続は解除されます。

```
var result = yield db.open();
```


## テーブル一覧の取得

```javascript
var names = yield db.getTables();
```

## テーブルの作成

テーブルの作成はデータを挿入する事で自動的に行われます。  
そのため明示して行う事はありません。

## テーブルの構成変更

Mongodbではテーブルの構成変更をサポートしていません。  
そのため明示して行う事はありません。

## テーブルの削除

```javascript
var result = yield db.dropTable(table, options);
```

 + table {String} テーブル名
 + options {Object} オプション
    + ifExists {Boolean} テーブルが存在しない場合に削除しても例外を発生しない
 + return {Boolean} テーブルを削除した場合にtrue

## インデックスの追加

```javascript
var result = yield db.addIndex(table, indexes, options);
```

 + table {String} テーブル名
 + indexes {String|Array} インデックス
    + 文字列の場合、単体のフィールド名は`name`など、逆順にする場合は`-name`と前にマイナスをつけてください
    + 複合インデックスは、`name, age`などカンマ区切りの文字列で設定してください
    + 配列で設定する事もできます。`name, age`は['name', 'age']になります
 + options {Object} オプション
    + unique {Boolean} 一意インデックスの追加
    + ifExists {Boolean} 既に同値のインデックスが追加されている場合でも例外を発生しない
 + return {Boolean} 追加された場合はtrue

### `indexes`の例

  + `'name'`。`name`フィールドに昇順のインデックスを追加
  + `'name, age'`。`name`と`age`の優先順位で昇順のインデックスを追加
  + `'name, -age'`。`name`を昇順で、`age`を降順でインデックスを追加
  + `['name', 'age']`。`'name, age'`と同じ
  + `['name', ['age', false]]`。`'name, -age'`と同じ
  + `[['name', true], ['age', false]]`。`'name, -age'`と同じ

 下の例ほど正しい記述方法だが、簡易な記述で問題ない。


## インデックスの削除

```javascript
var success = yield db.removeIndex(table, indexes, options);
```

 + table {String} テーブル名
 + indexes {String|Array} インデックス。フォーマットは「indexesの例」を参照すること
 + options {Object} オプション
    + ifExists {Boolean} インデックスが存在しない場合に削除しても例外を発生しない

## 新規の行IDの取得

新規に行を追加する際に、予め行番号を設定したい場合に作成する事が出来ます。

```javascript
var rowId = yield db.createId();
```

## 複数行の取得

```javascript
var rows = yield db.find(table, selector, fields, options);
```
 + table {String} テーブル名
 + selector {Object|String} 抽出条件
    + フィールド名をキー、一致条件を値とするオブジェクトを設定します
    + 文字列を指定した場合は、行番号と見なします
 + fields {String|Array} フィールド
    + 複数のフィールドを指定する場合は、カンマ区切りもしくは配列を設定します
 + options {Object} オプション
    + sort {String|Array} 表示順
        + 「indexesの例」と同じように設定します
    + skip {Number} 開始行番号
    + limit {Number} 表示行数
 + return {Array} rows


## 単行の取得

最初に取得した行を返します。

```javascript
var row = yield db.getRow(table, selector, fields, options);
```
 + table {String} テーブル名
 + selector {Object|String} 抽出条件
    + フィールド名をキー、一致条件を値とするオブジェクトを設定します
    + 文字列を指定した場合は、行番号と見なします
 + fields {String|Array} フィールド
    + 複数のフィールドを指定する場合は、カンマ区切りもしくは配列を設定します
 + options {Object} オプション
    + sort {String|Array} 表示順
        + 「indexesの例」と同じように設定します
    + skip {Number} 開始行番号
 + return {Object} row


## 値の取得

最初に取得した行の指定フィールドの値を取得します。

```javascript
var row = yield db.getValue(table, selector, field, options);
```
 + table {String} テーブル名
 + selector {Object|String} 抽出条件
    + フィールド名をキー、一致条件を値とするオブジェクトを設定します
    + 文字列を指定した場合は、行番号と見なします
 + field {String} フィールド
 + options {Object} オプション
    + sort {String|Array} 表示順
        + 「indexesの例」と同じように設定します
    + skip {Number} 開始行番号
 + return {Mixed} value


## 追加更新

データには行番号(rowId)を必ず含む必要があります。  
指定した行が存在する場合は更新、存在しない場合は追加します

```javascript
var result = yield db.upsert(table, data, options);
```

 + table {String} テーブル名
 + data  {Object} データ
 + options {Object} オプション
    + replace {Boolean} 置換。すべてのフィールドの値を破棄し、置き換えます
 + result {Boolean} 成否

## 追加

```javascript
var rowId = yield db.add(table, data);
```
 + table {String} テーブル名
 + data {Objecct} データ
 + return {String} 行番号

## 一括更新

```javascript
yield db.update(table, selector, data, options);
```

 + table {String} テーブル名
 + selector {String|Object} 抽出条件
 + data {Object} 更新データ
 + options {Object} オプション

## 削除

```javascript
yield db.remove(table, selector, options);
```

 + table {String} テーブル名
 + selector {String|Object} 抽出条件
 + options {Object} オプション

## map-reduce

```javascript
yield db.mapReduce(table, map, reduce, options);
```

## SQL

SQLはサポートしていません


