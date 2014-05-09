/*jshint node:true*/

'use strict';

var Mongo = require('..');
var assert = require('assert');
var co = require('co');

var mongo;
var tables;

co(function*(){

  mongo = new Mongo();
  tables = yield mongo.getTables();
  assert(Array.isArray(tables));

})();

