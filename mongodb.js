'use strict';

/*
 * dependencies
 */
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var MongoDB = require('mongodb');
var cis = require('cocotte-is');
var msg = require('cocotte-message');

/*
 * alias
 */
var alt = cis.alt;
var ObjectID = MongoDB.ObjectID;
var debug = msg.debug('cocotte-db-mongodb');
var doNothing = function (){};

/*
 * lib
 */
var indexesParse = require('./lib/index-parse');
var indexesDeparse = require('./lib/index-deparse');
var selectorParse = require('./lib/selector-parse');
var fieldsParse = require('./lib/fields-parse');
var findOptionsParse = require('./lib/find-options-parse');
var dataParse = require('./lib/data-parse');
var getIndexName = require('./lib/get-index-name');

/**
 * アイドル状態までの接続維持時間(ms)
 */
var connectionTime = 300;

/**
 * コンストラクタ
 * @class Mongo
 * @constructor
 * @param  {Object} schema 
 *      host: {String} 接続先
 *      port: {Number} ポート番号
 *      db  : {String} データベース名
 */
var Mongo = function Mongo (schema) {
  debug();

  schema = alt(Object, schema, {});

  /**
   * ホスト
   * @property {String} host
   * @default 127.0.0.1
   */
  var host = alt(String, schema.host, '127.0.0.1');

  /**
   * ポート
   * @property {Number} port
   * @default  27017
   */
  var port = alt(Number, schema.port, 27017);

  /**
   * 接続先データベース
   * @property {String} db
   * @default  cocotte
   */
  this.dbName = alt(String, schema.db, 'cocotte');

  /**
   * DB
   * @type {MongoDB}
   */
  this.db = new MongoDB.Db(this.dbName, new MongoDB.Server(host, port), {safe:true});

  /**
   * 接続状況
   * @property {enum} connectionStatus
   */
  this.connectionStatus = Mongo.CONNECTION_STATUSES.CLOSE;

  /**
   * 実行中の数
   */
  this.active = 0;

  /**
   * 現在の接続で処理を開始したタスクの数
   */
  this.tasks = 0;

  /**
   * リスナー無制限
   */
  this.setMaxListeners(0);

  /**
   * アイドル状態になると自動的に接続解除を行う
   */
  this.on('disactived', this.close());
};

util.inherits(Mongo, EventEmitter);

/**
 * ステータス
 */
Mongo.CONNECTION_STATUSES = {
  OPENNING: 1,  // 接続を開く処理を実行中である
  OPEN: 2,      // 接続は開かれている
  ACTIVE: 3,    // コマンドが実行中である
  CLOSING: 4,   // 接続を閉じる処理を実行中である
  CLOSE: 5,     // 接続は閉じられている
};

// データベースへの問い合わせの開始
var queryStart = function queryStart (mongo) {
  mongo.active++;
  mongo.tasks++;
  if (mongo.active === 1) {
    mongo.connectionStatus = Mongo.CONNECTION_STATUSES.ACTIVE;
    mongo.emit('actived');
  }
};

// データベースへの問い合わせ完了
var queryEnd = function queryEnd (mongo, callback, err, result) {
  mongo.active--;
  if (!mongo.active) {
    mongo.connectionStatus = Mongo.CONNECTION_STATUSES.OPEN;
    mongo.emit('disactived');
  }
  callback(err, result);
};


/**
 * 接続を開く
 * @method open
 * @return {Thunk.<MongoDB.DB>} db
 */
Mongo.prototype.open = function open() {
  debug();
  var self = this;
  var STATUSES = Mongo.CONNECTION_STATUSES;

  return function openThunk (callback) {
    switch(self.connectionStatus) {
    case STATUSES.OPENNING:
      self.once('opened', function () {callback(null, self.db);});
      break;
    case STATUSES.OPEN:
      callback(null, self.db);
      break;
    case STATUSES.ACTIVE:
      self.once('disactived', function () {callback(null, self.db);});
      break;
    case STATUSES.CLOSING:
      self.once('closed', function () {self.open()(callback);});
      break;
    case STATUSES.CLOSE:
      self.connectionStatus = STATUSES.OPENNING;
      self.emit('openning');
      // 接続開始
      self.db.open(function (err){
        if (err) {
          self.connectionStatus = STATUSES.CLOSE;
        } else {
          self.connectionStatus = STATUSES.OPEN;
          self.tasks = 0;
          self.emit('opened');
          idle(self);
        }
        callback(err, self.db);
      });
      break;
    }
  };
};

/**
 * 接続直後から接続維持時間を超えてもアクティブな処理を行っていない場合は
 * 接続の解除を起こすdisactivedイベントを発行する
 * @method idle
 * @param  {Mongo} self
 */
var idle = function idle (self) {
  debug();
  setTimeout(function(){
    if (!self.tasks && self.connectionStatus === Mongo.CONNECTION_STATUSES.OPEN) {
      self.emit('disactived');
    }
  }, connectionTime);
};

/**
 * 接続を解除
 * @method close
 * @return {Thunk.<Boolean>} closed
 */
Mongo.prototype.close = function close () {
  debug();
  var self = this;
  var STATUSES = Mongo.CONNECTION_STATUSES;

  return function closeThunk (callback) {
    callback = callback || doNothing;
    switch(self.connectionStatus) {
    case STATUSES.OPENNING:
      self.once('opened', function () {self.close()(callback);});
      break;
    case STATUSES.OPEN:
      setTimeout(function(tasks){
        if (tasks === self.tasks) {
          self.connectionStatus = STATUSES.CLOSING;
          self.emit('closing');
          self.db.close(function(err){
            if (err) {
              self.connectionStatus = STATUSES.OPEN;
            } else {
              self.connectionStatus = STATUSES.CLOSE;
              self.emit('closed');
            }
            callback(err, !err);
          });
        } else {
          callback(null, false);
        }
      }, connectionTime, self.tasks);
      break;
    case STATUSES.ACTIVE:
      self.once('disactived', function () {self.close()(callback);});
      break;
    case STATUSES.CLOSING:
      self.once('closed', function () {callback(null, true);});
      break;
    case STATUSES.CLOSE:
      callback(null, true);
      break;
    }
  };
};

/**
 * テーブル一覧を取得
 * @method getTables
 * @return {Thunk.<Array.String>} tableNames
 */
Mongo.prototype.getTables = function getTables () {
  debug();

  var self = this;
  var prefix = self.dbName + '.';

  return function getTablesThunk (callback) {
    callback = callback || doNothing;
    self.open()(function(e, db) {
      if (e) {
        callback(e, null);

      } else {
        queryStart(self);
        db.collectionNames(function(err, results) {
          if (err) {
            queryEnd(self, callback, err, null);

          } else {
            var tables = results.reduce(function (x, item) {
              var name = item.name.replace(prefix, '');
              if (!~name.indexOf('.')) {
                x.push(name);
              }
              return x;
            }, []);
            queryEnd(self, callback, null, tables);
          }
        });

      }
    });
  };
};

/**
 * テーブルの削除
 * @method dropTable
 * @param  {String}  table
 * @param  {Object}  options
 *            {Boolean} ifExists テーブルが存在しない場合も例外を発生させない
 * @return {Thunk.<Boolean>} success
 */
Mongo.prototype.dropTable = function dropTable (table, options) {
  var self = this;
  options = alt(Object, options, {});

  // @return {Boolean} 削除した場合はtrue
  return function dropTableThunk (callback) {
    callback = callback || doNothing;
    self.open()(function(err, db) {
      if (err) {
        callback(err, false);

      } else {
        queryStart(self);
        db.dropCollection(table, function (err, result) {
          err = options.ifExists ? null : err;
          queryEnd(self, callback, err, result);
        });

      }
    });
  };
};

/**
 * インデックス一覧を取得する
 * @method getIndexes
 * @param  {String} table
 * @param  {Object} options
 *           {Boolean} ifExists
 * @return {Thunk.<Array.Array.String>} indexes
 */
Mongo.prototype.getIndexes = function getIndexes (table, options) {
  var self = this;
  var prefix = this.dbName + '.';
  options = alt(Object, options, {});

  // @return {Array} indexes
  return function getIndexesThunk (callback) {
    callback = callback || doNothing;
    self.open()(function(err, db){
      if (err) {
        callback(err, null);

      } else {
        queryStart(self);
        db.collection(table).indexInformation(function(err, indexes) {
          if (err) {
            queryEnd(self, callback, err, null);

          } else {
            indexes = indexesDeparse(indexes);

            // テーブルの存在確認を行う
            if (!options.ifExists && !indexes.length) {
              db.collectionNames(function (err, names) {
                var exists = names && names.some(function(t){return t.name === prefix + table; });
                if (!err && !exists) {
                  err = new Error('テーブルが存在しません');
                }
                queryEnd(self, callback, err, indexes);
              });

            } else {
              queryEnd(self, callback, err, indexes);
            }
          }
          
        });

      }
    });
  };
};

/**
 * インデックスの追加
 * @method  addIndex
 * @param  {String}  table
 * @param  {Array}   fields
 * @param  {Object}  options
 *           {Boolean} unique
 *           {Boolean} ifExists 
 * @return {Thunk.<Boolean>} success
 */
Mongo.prototype.addIndex = function addIndex (table, fields, options) {
  var self = this;
  var indexes = indexesParse(fields);

  // オプション
  options = alt(Object, options, {});
  var op = {background: true};
  if (options.unique) {
    op.unique = true;
  }

  return function addIndexThunk (callback) {
    callback = callback || doNothing;
    self.open()(function(err, db) {
      if (err) {
        callback(err, false);

      } else {
        queryStart(self);
        db.collection(table).createIndex(indexes, op, function(err, name) {
          var success = err ? null : !!name;
          err = options.ifExists ? null : err;
          queryEnd(self, callback, err, success);
        });

      }
    });
  };
};

/**
 * インデックスの削除
 * @method removeIndex
 * @param  {String}  table
 * @param  {String|Array}   fields
 * @param  {Object}  options
 *           {Boolean} ifExists 
 * @return {Thunk.<Boolean>} success
 */
Mongo.prototype.removeIndex = function removeIndex (table, fields, options) {
  var self = this;
  var index = indexesParse(fields);

  options = alt(Object, options, {});

  return function removeIndexThunk (callback) {
    callback = callback || doNothing;
    if (!index) {
      var e = new Error('インデックスを設定するフィールドを正しく設定してください');
      callback(e, false);
      return;
    }

    self.open()(function(err, db) {
      if (err) {
        callback(err, false);

      } else {
        queryStart(self);
        var coll = db.collection(table);

        // 既存インデックスの調査
        coll.indexInformation(function(err, indexes) {
          if (err) {
            queryEnd(self, callback, err, false);

          } else {
            var indexName = getIndexName(index, indexes);
            if (indexName) {
              // 削除
              coll.dropIndex(indexName, function(err) {
                queryEnd(self, callback, err, !err);
              });

            } else {
              if (!options.ifExists) {
                err = new Error('存在しないインデックスです');
              }
              queryEnd(self, callback, err, false);
            }
          }
        });
      }
    });
  };
};

/**
 * 行を特定するIDを作成
 * @method createId
 * @param  {String}   table
 * @return {Thunk.<String>} rowId
 */
Mongo.prototype.createId = function createId (table) {
  table = null;

  return function createIdThynk (callback) {
    callback = callback || doNothing;
    callback(null, (new ObjectID()).toString());
  };
};

/**
 * 複数行を取得
 * @method find
 * @param  {String}       table
 * @param  {Object}       selector
 * @param  {String|Array} fields
 * @param  {Object}       options
 *           {String|Array} sort
 *           {Number}       skip
 *           {Number}       limit
 * @return {Thunk.<Array.Object>} rows
 */
Mongo.prototype.find = function find (table, selector, fields, options) {
  var self = this;
  selector = selectorParse(selector);
  fields = fieldsParse(fields);
  options = findOptionsParse(options, ['sort', 'skip', 'limit']);

  // _idを指定した場合はlimitが強制的に設定される
  if (selector._id) {
    options.limit = 1;
  }

  return function findThunk (callback) {
    callback = callback || doNothing;
    self.open()(function(e, db) {
      if (e) {
        callback(e, []);

      } else {
        queryStart(self);
        db.collection(table)
          .find(selector, fields, options)
          .toArray(function(err, results) {
            results.forEach(function(row) {
              row.rowId = row._id.toString();
              delete row._id;
            });
            queryEnd(self, callback, err, results);
          });

      }
    });
  };
};

/**
 * 最初の行を返す
 * 存在しない場合はnullを返します
 * @method getRow
 * @param  {String}        table
 * @param  {String|Object} selector
 * @param  {Array}         fields
 * @param  {Object}        options
 *           {String|Array}  sort
 *           {Number}        skip
 * @return {Thunk.<Object>} row
 */
Mongo.prototype.getRow = function getRow (table, selector, fields, options) {
  var self = this;
  var idFind = typeof selector === 'string';
  selector = selectorParse(selector);
  fields = fieldsParse(fields);
  options = idFind ? null : findOptionsParse(options, ['sort', 'skip']);

  return function getRowThunk (callback) {
    callback = callback || doNothing;
    self.open()(function(err, db) {
      if (err) {
        callback(err, null);

      } else {
        queryStart(self);
        db.collection(table).findOne(selector, fields, options, function (err, doc) {
          if (doc) {
            doc.rowId = doc._id.toString();
            delete doc._id;
          }
          queryEnd(self, callback, err, doc);
        });
      }
    });
  };
};

/**
 * 最初の行の指定フィールドの値を取得する
 * selectorに文字列を指定した場合は、行番号を指定したと見なします
 * @method getValue
 * @param  {String}         table
 * @param  {String|Object}  selector
 * @param  {String}         field
 * @param  {Object}         options
 *           {String|Array}   sort
 *           {Number}         skip
 * @return {Thunk.<Mixed>} value 
 */
Mongo.prototype.getValue = function getValue (table, selector, field, options) {

  if (typeof field !== 'string') {
    throw new Error('フィールドを指定してください');
  }

  var self = this;
  selector = selectorParse(selector);
  var fields = {};
  fields[field] = 1;
  options = findOptionsParse(options, ['sort', 'skip']);

  return function getValueThunk (callback) {

    self.open()(function(err, db) {
      if (err) {
        callback(err, null);

      } else {
        queryStart(self);
        db.collection(table).findOne(selector, fields, options, function (err, doc) {
          queryEnd(self, callback, err, doc ? doc[field] : null);
        });

      }
    });
  };
};

/**
 * 行の保存
 *
 * 必ずrowにrowIdが含まれる必要があります
 * そのrowIdと同じ行がデータベースに存在しない場合は追加に
 * 存在する場合は更新になります
 * 
 * @method save
 * @param {String}   table
 * @param {Object}   row
 * @return {Thunk.<Boolean>} success
 */
Mongo.prototype.save = function save (table, row) {

  if (!row.rowId) {
    throw new Error('データに行番号の設定がありません');
  }

  var self = this;
  var selector = {_id: new ObjectID(row.rowId)};
  row = dataParse(row, 'update');
  var options = {w: 1, upsert: true};

  return function saveThunk (callback) {
    callback = callback || doNothing;
    self.open()(function(err, db) {
      if (err) {
        callback(err, null);

      } else {
        queryStart(self);
        db.collection(table).update(selector, row, options, function(err, result) {
          queryEnd(self, callback, err, !!result);
        });
      }
    });
  };
};

/**
 * 行の追加
 *
 * saveと異なりrowにrowIdを含んではいけません
 * 
 * @method add
 * @param {String}   table
 * @param {Object}   row
 * @return {Thunk.<String>} rowId
 */
Mongo.prototype.add = function add (table, row) {

  if (row.rowId) {
    throw new Error('行番号を指定してはいけません');
  }

  var self = this;

  row = dataParse(row, 'add');
  if (!row) {
    throw new Error('データが正しくありません');
  }

  var options = {w: 1};

  // @return {String} rowId
  return function addThunk (callback) {
    callback = callback || doNothing;
    self.open()(function(err, db) {
      if (err) {
        callback(err, null);

      } else {
        queryStart(self);
        db.collection(table).insert(row, options, function(err, result) {
          var rowId = result && result[0] ? result[0]._id.toString() : null;
          queryEnd(self, callback, err, rowId);
        });

      }
    });
  };
};

/**
 * 行の一括更新
 * @method  update
 * @param  {String}  table
 * @param  {Object}  selector
 * @param  {Object}  data
 * @return {Thunk.<Number>} effectRowCount
 */
Mongo.prototype.update = function update (table, selector, data) {

  var self = this;

  // data
  data = dataParse(data, 'update');
  if (!data) {
    throw new Error('更新データが正しくありません');
  }

  // selector
  selector = selectorParse(selector);

  // option
  var options = {w: 1};
  if (!selector._id) {
    options.multi = true;
  }

  return function updateThunk (callback) {
    callback = callback || doNothing;
    self.open()(function(err, db) {
      if (err) {
        callback(err, 0);

      } else {
        queryStart(self);
        db.collection(table).update(selector, data, options, function (err, result) {
          queryEnd(self, callback, err, result);
        });

      }
    });
  };
};

/**
 * 行の削除
 *
 * selectorに文字列を設定すると行番号と見なします
 * オブジェクトを設定すると複数行の削除をします
 * 行を設定した場合は、対象行を削除します
 * 
 * @method remove
 * @param  {String}        table
 * @param  {String|Object} selector
 * @return {Thunk.<Number>} effectRowCount
 */
Mongo.prototype.remove = function remove (table, selector) {

  var self = this;
  selector = selectorParse(selector);
  var options = selector._id ? {w: 1} : {w: 1, multi: true};

  // @return {Number} effectRowCount
  return function removeThunk (callback) {
    callback = callback || doNothing;
    self.open()(function(err, db) {
      if (err) {
        callback(err, null);

      } else {
        queryStart(self);
        db.collection(table).remove(selector, options, function(err, result) {
          queryEnd(self, callback, err, result);
        });

      }
    });
  };
};

module.exports = exports = Mongo;