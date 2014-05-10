'use strict';

var ObjectID = require('mongodb').ObjectID;

/**
 * 追加や更新のデータのパース
 * @method dataParse
 * @param  {Object}  data
 * @param  {String}  type
 * @return {Object}
 */
function dataParse (data, type) {

  if (!data || typeof data !== 'object') {
    return null;
  }

  var rtn = {};

  if (type === 'add') {
    if (typeof data.rowId === 'string') {
      rtn._id = new ObjectID(data.rowId);

    } else {
      rtn._id = new ObjectID();

    }
  }

  Object.keys(data).forEach(function (p){
    if (p !== 'rowId') {
      rtn[p] = data[p];
    }
  });

  if (type === 'update') {
    var s = {};
    var s_e = false;
    var u = {};
    var u_e = false;
    // setとunsetに分ける
    Object.keys(rtn).forEach(function (key) {
      if (rtn[key] === null || rtn[key] === void 0) {
        u_e = true;
        u[key] = '';
      } else {
        s_e = true;
        s[key] = rtn[key];
      }
    });
    rtn = {};
    if (s_e) {
      rtn.$set = s;
    }
    if (u_e) {
      rtn.$unset = u;
    }
  }
  return rtn;
}

module.exports = exports = dataParse;