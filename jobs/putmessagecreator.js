function createPutMessageJob (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    PutEntityJob = mylib.PutEntityJob;

  function PutMessageJob (bank, messageid, messageval, defer) {
    PutEntityJob.call(this, bank, messageid, messageval, defer);
  }
  lib.inherit(PutMessageJob, PutEntityJob);
  PutMessageJob.prototype.entityCollectionName = 'messages';

  mylib.PutMessageJob = PutMessageJob;
}

module.exports = createPutMessageJob;
