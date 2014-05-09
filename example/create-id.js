'use strict';

var co = require('co');
var Mongo = require('..');
var db = new Mongo();

co(function*(){

  console.log(yield db.createId());

})();