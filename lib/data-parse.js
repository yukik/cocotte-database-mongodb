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
    rtn = {$set: rtn};
  }

  return rtn;
}

module.exports = exports = dataParse;