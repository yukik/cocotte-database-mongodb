'use strict';

var Mongo = require('..');
// var assert = require('assert');
var co = require('co');

var mongo = new Mongo();

mongo.on('openning', function () {console.log('openning');});
mongo.on('opened', function () {console.log('opened');});
mongo.on('closing', function () {console.log('closing');});
mongo.on('closed', function () {console.log('closed');});
mongo.on('actived', function () {console.log('actived');});
mongo.on('disactived', function () {console.log('disactived');});

/**
 * 接続テスト
 */
co(function*(){

//  yield mongo.open();
  yield mongo.find('testdb1', {score: 1});
  yield mongo.find('testdb1', {score: 2});

})();





