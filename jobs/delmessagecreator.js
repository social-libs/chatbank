function createDelMessageJob (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    DelEntityJob = mylib.DelEntityJob;

  function DelMessageJob (bank, messageid, defer) {
    DelEntityJob.call(this, bank, messageid, defer);
  }
  lib.inherit(DelMessageJob, DelEntityJob);
  DelMessageJob.prototype.entityCollectionName = 'messages';

  mylib.DelMessageJob = DelMessageJob;
}

module.exports = createDelMessageJob;
