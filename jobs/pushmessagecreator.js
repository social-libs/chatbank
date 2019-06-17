function createPushMessageJob (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    PushEntityJob = mylib.PushEntityJob;

  function PushMessageJob (bank, messageval, defer) {
    PushEntityJob.call(this, bank, messageval, defer);
  }
  lib.inherit(PushMessageJob, PushEntityJob);
  PushMessageJob.prototype.entityCollectionName = 'messages';

  mylib.PushMessageJob = PushMessageJob;
}

module.exports = createPushMessageJob;
