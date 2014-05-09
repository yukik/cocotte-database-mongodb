'use strict';
var Mongo = require('..');
var mongo = new Mongo();

var i;
var j = 0;
var max = 10;
var active = 0;

var find = function () {
  active++;
  var score = Math.floor(Math.random()*101);
  var d = new Date();
  mongo.find('testdb1', {score: score})(function (e, r) {
    var ms = new Date() - d;
    console.log('score=%s, count=%s, active=%s, ms=%s',
      ('  ' + score).slice(-3), ('     ' + r.length).slice(-5), ('   ' + active).slice(-3), ('      ' + ms).slice(-6));
    j++;
    active--;
  });
};

for(var i = 0; i < max; i++) {
  var t = Math.floor(Math.random() * max * 250) + 100;
  setTimeout(find, t);
}


// coを使用した場合
// var co = require('co');

// var find2 = function () {
//   active++;
//   var score = Math.floor(Math.random()*101);
//   var d = new Date();

//   return co(function*(){
//     var r = yield mongo.find('testdb1', {score: score});
//     var ms = new Date() - d;
//     console.log('score=%s, count=%s, active=%s, ms=%s',
//       ('  ' + score).slice(-3), ('     ' + r.length).slice(-5), ('   ' + active).slice(-3), ('      ' + ms).slice(-6));
//     j++;
//     active--;
//   });
// };

// for(var i = 0; i < max; i++) {
//   var t = Math.floor(Math.random() * max * 250) + 100;
//   setTimeout(find2(), t);
// }
