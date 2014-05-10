'use strict';

// require('cocotte-message').enable();

var Mongo = require('..');
// var assert = require('assert');
var co = require('co');

var mongo = new Mongo();

// mongo.on('openning', function () {console.log('openning');});
// mongo.on('opened', function () {console.log('opened');});
// mongo.on('closing', function () {console.log('closing');});
// mongo.on('closed', function () {console.log('closed');});
// mongo.on('actived', function () {console.log('actived');});
// mongo.on('disactived', function () {console.log('disactived');});

/**
 * 接続テスト
 */
co(function*(){

  for(var x=0; x < 5; x++) {
    var r = yield mongo.getRow('testdb1', {score: x});
    console.log(x + ':' + r.name);
  }

  // rr.forEach(function(r, x){
  //   console.log(x + ':' + r.length);
  // });


  // for(x=50; x < 70; x++) {
  //   r = yield mongo.find('testdb1', {score: x});
  //   console.log(x + ':' + r.length);
  // }

})();


