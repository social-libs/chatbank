function createPutUserJob (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    PutEntityJob = mylib.PutEntityJob;

  function PutUserJob (bank, userid, userval, defer) {
    PutEntityJob.call(this, bank, userid, userval, defer);
  }
  lib.inherit(PutUserJob, PutEntityJob);
  PutUserJob.prototype.entityCollectionName = 'users';

  mylib.PutUserJob = PutUserJob;
}

module.exports = createPutUserJob;
